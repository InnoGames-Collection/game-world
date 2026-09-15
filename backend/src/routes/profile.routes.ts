import { FastifyInstance } from 'fastify';
import { requireAuth } from '../middleware/auth.js';
import { authService } from '../services/authService.js';
import { query } from '../config/database.js';

export async function profileRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', requireAuth);

  // Get current authenticated user profile
  fastify.get('/', async (request, reply) => {
    const profile = await authService.getProfile(request.user!.userId);
    if (!profile) {
      return reply.status(404).send({ success: false, message: 'Profile not found' });
    }
    return reply.send(profile);
  });

  // Update profile attributes (displayName, avatarId)
  fastify.put('/', async (request, reply) => {
    const userId = request.user!.userId;
    const body = request.body as { displayName?: string; avatarId?: string };

    if (body.displayName) {
      await query(`UPDATE profiles SET display_name = $1, updated_at = NOW() WHERE id = $2`, [
        body.displayName.trim().slice(0, 50),
        userId,
      ]);
    }

    if (body.avatarId) {
      await query(`UPDATE profiles SET avatar_id = $1, updated_at = NOW() WHERE id = $2`, [
        body.avatarId.trim().slice(0, 30),
        userId,
      ]);
    }

    const updated = await authService.getProfile(userId);
    return reply.send(updated);
  });

  // Get user preferences
  fastify.get('/preferences', async (request, reply) => {
    const userId = request.user!.userId;
    const res = await query('SELECT * FROM user_preferences WHERE user_id = $1', [userId]);
    const p = res.rows[0] || {
      language: 'en',
      audio: true,
      haptics: true,
      notifications: true,
      low_data: false,
    };
    return reply.send({
      language: p.language,
      audio: p.audio,
      haptics: p.haptics,
      notifications: p.notifications,
      lowData: p.low_data,
    });
  });

  // Update user preferences
  fastify.put('/preferences', async (request, reply) => {
    const userId = request.user!.userId;
    const b = request.body as any;

    await query(
      `UPDATE user_preferences
          SET language = COALESCE($1, language),
              audio = COALESCE($2, audio),
              haptics = COALESCE($3, haptics),
              notifications = COALESCE($4, notifications),
              low_data = COALESCE($5, low_data),
              updated_at = NOW()
        WHERE user_id = $6`,
      [b.language, b.audio, b.haptics, b.notifications, b.lowData, userId]
    );

    return reply.send({ success: true, message: 'Preferences updated' });
  });
}
