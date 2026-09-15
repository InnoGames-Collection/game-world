/**
 * SOCCER PING PONG - League Standings Generator
 * Generates and updates authentic Championship Standings matching Video 1:
 * Table columns: POS, TEAM (Kit), W, D, L, GF, GA, PTS
 */

import { SoccerTeam, SOCCER_TEAMS } from './soccerTeams';
import { LeagueStanding, PlayerProgress } from './types';

export function getChampionshipStandings(
  playerTeamId: string,
  progress: PlayerProgress
): LeagueStanding[] {
  const standings: LeagueStanding[] = SOCCER_TEAMS.map((team, idx) => {
    const isPlayer = team.id === playerTeamId;
    if (isPlayer) {
      const wins = progress.totalWins;
      const losses = progress.totalLosses;
      const draws = Math.floor(progress.completedLevels.length * 0.2);
      const played = wins + losses + draws;
      const gf = progress.completedLevels.length * 3 + Math.floor(progress.totalReturnsCompleted / 10);
      const ga = losses * 2 + draws;
      const points = wins * 3 + draws;

      return {
        teamId: team.id,
        team,
        played: Math.max(played, progress.completedLevels.length),
        won: wins,
        drawn: draws,
        lost: losses,
        goalsFor: gf,
        goalsAgainst: ga,
        points: Math.max(points, progress.completedLevels.length * 3),
      };
    } else {
      // Procedural realistic record for computer teams
      const simulatedGames = Math.max(1, progress.completedLevels.length + 2);
      const baseStrength = team.stars * 2 + (8 - idx);
      const won = Math.min(simulatedGames, Math.max(0, Math.floor(simulatedGames * (baseStrength / 18))));
      const lost = Math.max(0, simulatedGames - won - (simulatedGames > 3 ? 1 : 0));
      const drawn = simulatedGames - won - lost;
      const gf = won * 2 + drawn;
      const ga = lost * 2 + drawn;
      const points = won * 3 + drawn;

      return {
        teamId: team.id,
        team,
        played: simulatedGames,
        won,
        drawn,
        lost,
        goalsFor: gf,
        goalsAgainst: ga,
        points,
      };
    }
  });

  // Sort by points desc, then goal difference (GF - GA) desc
  return standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    return b.goalsFor - a.goalsFor;
  });
}
