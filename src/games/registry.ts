/**
 * Game Registry for GameON Tele (telebirr Game Center)
 * Bridges the data-driven GameCatalog (scalable to 100+ games) with GameDefinition interface.
 */

import { GameDefinition, GameCategory } from '../types';
import { GameCatalog, CatalogGame } from '../services/gameCatalog';
import { getGameArtworkUrl } from '../services/gameArtwork';

export function catalogGameToDefinition(g: CatalogGame): GameDefinition {
  const artwork = getGameArtworkUrl(g.gameId);
  return {
    id: g.gameId,
    title: g.gameName,
    titleAmharic: g.titleAmharic,
    category: g.category as GameCategory,
    genre: g.genre,
    tagline: g.tagline,
    description: g.description,
    difficulty: 'Medium',
    thumbnailUrl: artwork || g.thumbnail,
    bannerUrl: artwork || g.banner,
    primaryColor: g.primaryColor,
    secondaryColor: g.secondaryColor,
    rating: g.rating,
    playsCount: g.playsCount,
    energyCost: 0,
    entryCostCoins: g.coinCost,
    featured: g.isFeatured,
    isNew: g.isNew,
    isTrending: g.isRecommended,
    instructions: g.instructions,
    controlsDescription: g.controlsDescription,
    accessType: g.accessType,
    isFree: g.isFree,
    requiresCoins: g.requiresCoins,
    coinCost: g.coinCost,
    price: g.price,
    subscriptionOptions: g.subscriptionOptions,
    leaderboardEnabled: g.leaderboardEnabled,
    sortOrder: g.sortOrder,
    providerId: g.providerId,
    providerName: g.providerName,
  };
}

export const GameRegistry = {
  getAllGames(): GameDefinition[] {
    return GameCatalog.getAll().map(catalogGameToDefinition);
  },

  getGameById(id: string): GameDefinition | undefined {
    const c = GameCatalog.getById(id);
    return c ? catalogGameToDefinition(c) : undefined;
  },

  getFeaturedGames(): GameDefinition[] {
    return GameCatalog.getFeatured().map(catalogGameToDefinition);
  },

  getGamesByCategory(category: GameCategory | string): GameDefinition[] {
    if (category === 'all' || category === 'All Games') {
      return this.getAllGames();
    }
    return GameCatalog.getByCategory(category).map(catalogGameToDefinition);
  },

  searchGames(query: string): GameDefinition[] {
    return GameCatalog.search(query).map(catalogGameToDefinition);
  },
};

