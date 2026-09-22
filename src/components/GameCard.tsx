/**
 * GameON Tele - Standardized Professional Game Card
 * Ensures 100% identical physical dimensions, fixed responsive aspect ratio (2.3:1),
 * object-fit: cover, and premium visual treatment across all 20 games.
 */

import React from 'react';
import { GameDefinition } from '../types';
import { ProfessionalGameCard } from './ProfessionalGameCard';

export interface GameCardProps {
  game: GameDefinition;
  onPlay: (game: GameDefinition) => void;
  onClickDetails?: (game: GameDefinition) => void;
  layout?: 'carousel' | 'grid';
  aspectRatio?: '4/3' | '16/9';
  hasActiveAccess?: boolean;
  className?: string;
}

export const GameCard: React.FC<GameCardProps> = (props) => {
  return <ProfessionalGameCard {...props} />;
};

export default GameCard;
