import { query } from '../config/database.js';
import { cache } from '../config/cache.js';
import { signGameRoundToken, verifyGameRoundToken } from '../utils/jwt.js';
import { authService } from './authService.js';
import { tournamentService } from './tournamentService.js';
import { GameSessionResult, UserProfile, RewardTransaction, GameEntitlement } from '../types/domain.js';
import crypto from 'crypto';
import pino from 'pino';

const logger = pino({ name: 'GameSessionService' });

export const TOURNAMENT_GAME_IDS = ['crazy-colors', 'fruit-slice', 'helix-jump', 'pop-piano'];
export const TOURNAMENT_PLAY_COIN_COST = 2; // 2 coins per tournament play (10 coins = 5 plays)

export const gameSessionService = {
  /**
   * Check game launch entitlement and launch game session.
   * All games are FREE except the 4 tournament games played in tournament mode,
   * which cost 2 coins per play.
   */
  async startSession(
    userId: string,
    gameId: string,
    tournamentId?: string
  ): Promise<{
    sessionId: string;
    token: string;
    entitlement: GameEntitlement;
    updatedProfile: UserProfile;
  }> {
    const profile = await authService.getProfile(userId);
    if (!profile) {
      throw new Error('User profile not found');
    }

    const isTournament = Boolean(tournamentId) || TOURNAMENT_GAME_IDS.includes(gameId);
    let accessType: 'FREE' | 'COIN' | 'SUBSCRIPTION' = 'FREE';

    if (isTournament) {
      accessType = 'COIN';
      // Strict coin requirement for tournament play: 2 coins per play
      if (profile.coins < TOURNAMENT_PLAY_COIN_COST) {
        throw new Error(
          `Insufficient coins for tournament play. 2 coins required per play (current balance: ${profile.coins} coins). Purchase 10 coins for 10 ETB to play 5 matches!`
        );
      }

      // Deduct 2 coins atomically
      await query('SELECT apply_coins($1, $2, $3, $4)', [
        userId,
        -TOURNAMENT_PLAY_COIN_COST,
        `Tournament Match Play: ${gameId}`,
        tournamentId || gameId,
      ]);
    } else {
      // All other catalog games are 100% free!
      accessType = 'FREE';
    }

    const jti = crypto.randomUUID();
    const sessionId = `GSESS_${gameId}_${Date.now()}_${jti.slice(0, 8)}`;

    // Anti-cheat HMAC token
    const token = signGameRoundToken({ uid: userId, gid: gameId, tid: tournamentId, jti });

    // Store token in Valkey with 15-minute expiration
    await cache.set(`game_token:${jti}`, JSON.stringify({ uid: userId, gid: gameId, tid: tournamentId }), 900);

    // Record entitlement pass
    const expiresAt = Date.now() + 2 * 60 * 60 * 1000; // 2-hour session entitlement
    await query(
      `INSERT INTO game_entitlements (user_id, game_id, access_type, expires_at, transaction_ref)
       VALUES ($1, $2, $3, TO_TIMESTAMP($4 / 1000.0), $5)`,
      [userId, gameId, accessType, expiresAt, sessionId]
    );

    // Increment matches played
    await query(`UPDATE profiles SET matches_played = matches_played + 1 WHERE id = $1`, [userId]);

    const updatedProfile = (await authService.getProfile(userId))!;

    const entitlement: GameEntitlement = {
      gameId,
      gameName: gameId,
      accessType,
      grantedAt: Date.now(),
      expiresAt,
      transactionRef: sessionId,
    };

    return {
      sessionId,
      token,
      entitlement,
      updatedProfile,
    };
  },

  /**
   * Authoritative score submission with MANDATORY anti-cheat validation
   */
  async submitScore(
    userId: string,
    gameId: string,
    rawScore: number,
    durationSeconds: number,
    token?: string,
    tournamentId?: string
  ): Promise<{
    result: GameSessionResult;
    updatedProfile: UserProfile;
    transaction?: RewardTransaction;
  }> {
    // 1. Mandatory Anti-cheat token verification
    if (!token || token.trim() === '') {
      logger.warn({ userId, gameId }, 'Anti-cheat alert: Missing session token');
      throw new Error('Anti-cheat verification error: Session token is strictly required.');
    }

    const decoded = verifyGameRoundToken(token);
    if (!decoded || decoded.uid !== userId || decoded.gid !== gameId) {
      logger.warn({ userId, gameId, token }, 'Anti-cheat alert: Token mismatch or expired');
      throw new Error('Invalid or expired game session token. Score rejected.');
    }

    // Check anti-replay in PostgreSQL
    const nonceRes = await query('SELECT jti FROM used_nonces WHERE jti = $1', [decoded.jti]);
    if (nonceRes.rowCount && nonceRes.rowCount > 0) {
      logger.warn({ userId, jti: decoded.jti }, 'Anti-cheat alert: Token replayed');
      throw new Error('Game session token already consumed (Replay attack prevented).');
    }

    // Mark nonce as used
    await query('INSERT INTO used_nonces (jti, user_id, game_id) VALUES ($1, $2, $3)', [
      decoded.jti,
      userId,
      gameId,
    ]);

    // Remove from Valkey
    await cache.del(`game_token:${decoded.jti}`);

    // 2. Load scoring rules for game
    const ruleRes = await query('SELECT * FROM game_scoring_rules WHERE game_id = $1', [gameId]);
    const rules = ruleRes.rows[0] || {
      max_score: 400,
      max_score_per_second: 1000,
      min_duration_sec: 2,
    };

    // 3. Enforce strict scoring rules (max 400 points)
    let validScore = Math.min(rules.max_score || 400, Math.max(0, Math.round(rawScore)));

    // Velocity anti-cheat check
    const maxPossible = (rules.max_score_per_second || 1000) * Math.max(1, durationSeconds);
    if (validScore > maxPossible) {
      logger.warn({ userId, gameId, rawScore, maxPossible, durationSeconds }, 'Velocity rule capped score');
      validScore = Math.min(validScore, Math.round(maxPossible));
    }

    // 4. Calculate Economic Yield
    // Note: Coins are ONLY purchased via TeleBirr. Gameplay never credits coins.
    // Gold earned contributes to score / points and level progression.
    const goldEarned = Math.max(10, Math.floor(validScore / 2));
    const xpEarned = Math.max(10, Math.floor(validScore / 10));

    // 5. Atomic mutations in PostgreSQL (XP progression only, no free coins)
    await query('SELECT apply_xp($1, $2)', [userId, xpEarned]);

    // 6. High Scores & Daily Scores update
    const prevHsRes = await query('SELECT best_score FROM high_scores WHERE user_id = $1 AND game_id = $2', [
      userId,
      gameId,
    ]);
    const prevHs = prevHsRes.rows[0]?.best_score || 0;
    const isNewHighScore = validScore > prevHs;

    await query(
      `INSERT INTO high_scores (user_id, game_id, best_score, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id, game_id) DO UPDATE
         SET best_score = GREATEST(high_scores.best_score, EXCLUDED.best_score), updated_at = NOW()`,
      [userId, gameId, validScore]
    );

    await query(
      `INSERT INTO daily_scores (user_id, game_id, score_date, best_score)
       VALUES ($1, $2, CURRENT_DATE, $3)
       ON CONFLICT (user_id, game_id, score_date) DO UPDATE
         SET best_score = GREATEST(daily_scores.best_score, EXCLUDED.best_score)`,
      [userId, gameId, validScore]
    );

    if (isNewHighScore) {
      await query(`UPDATE profiles SET trophies_count = trophies_count + 1 WHERE id = $1`, [userId]);
    }

    // 7. Tournament submission if tournamentId provided
    let tournamentTx: RewardTransaction | undefined;
    if (tournamentId) {
      const tourneyRes = await tournamentService.submitScore(userId, tournamentId, validScore);
      tournamentTx = tourneyRes.transaction;
    }

    const updatedProfile = (await authService.getProfile(userId))!;

    const result: GameSessionResult = {
      gameId,
      score: validScore,
      coinsEarned: 0,
      goldEarned,
      xpEarned,
      isNewHighScore,
      durationSeconds,
    };

    return {
      result,
      updatedProfile,
      transaction: tournamentTx,
    };
  },
};
