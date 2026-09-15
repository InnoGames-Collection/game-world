/**
 * Bottom 3-Piece Tray Component with Touch Drag & Reshuffle Control
 */

import React from 'react';
import { TrayPiece } from '../types';
import { BlockRenderer } from '../blockRenderer';
import { RotateCw } from 'lucide-react';

interface TrayProps {
  pieces: TrayPiece[];
  reshuffleRemaining: number;
  onReshuffle: () => void;
  onPiecePointerDown: (e: React.PointerEvent, piece: TrayPiece, pieceIndex: number, anchorR?: number, anchorC?: number) => void;
  activeDragPieceId: string | null;
}

export const Tray: React.FC<TrayProps> = ({
  pieces,
  reshuffleRemaining,
  onReshuffle,
  onPiecePointerDown,
  activeDragPieceId,
}) => {
  return (
    <div className="w-full max-w-md mx-auto px-3 py-2 flex flex-col gap-2 select-none z-20">
      {/* Wooden Tray Container */}
      <div
        id="puzzle-block-tray"
        className="relative min-h-[105px] rounded-2xl bg-gradient-to-b from-[#4e1d0c] via-[#381307] to-[#250a04] border-2 border-[#b85a24]/80 shadow-[0_8px_20px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(0,0,0,0.8)] px-2 py-2 flex items-center justify-around gap-2"
      >
        {/* 3 Piece Slots */}
        {pieces.map((piece, idx) => {
          const isPlaced = piece.placed;
          const isDragging = activeDragPieceId === piece.instanceId;

          return (
            <div
              key={piece.instanceId}
              id={`tray-slot-${idx}`}
              className="relative flex-1 h-[88px] flex items-center justify-center rounded-xl bg-[#240c06]/70 border border-[#6b2a12]/50 shadow-inner"
            >
              {!isPlaced && !isDragging && (
                <div
                  onPointerDown={(e) => onPiecePointerDown(e, piece, idx)}
                  className="cursor-grab active:cursor-grabbing transform hover:scale-105 transition-transform duration-100 touch-none flex flex-col items-center justify-center p-1"
                >
                  <PieceMatrixView
                    matrix={piece.shape.matrix}
                    color={piece.shape.color}
                    special={piece.shape.special}
                    onCellPointerDown={(e, r, c) => onPiecePointerDown(e, piece, idx, r, c)}
                  />
                </div>
              )}

              {/* Ghost outline if currently dragging from this slot */}
              {isDragging && (
                <div className="opacity-25 scale-95 flex flex-col items-center justify-center p-1 pointer-events-none">
                  <PieceMatrixView matrix={piece.shape.matrix} color={piece.shape.color} special={piece.shape.special} />
                </div>
              )}
            </div>
          );
        })}

        {/* Reshuffle / Re-roll Button */}
        <div className="flex flex-col items-center justify-center pl-1">
          <button
            id="btn-puzzle-reshuffle"
            onClick={onReshuffle}
            disabled={reshuffleRemaining <= 0}
            aria-label={`Reshuffle Pieces (${reshuffleRemaining} left)`}
            className={`relative w-11 h-11 rounded-xl flex items-center justify-center border transition-all ${
              reshuffleRemaining > 0
                ? 'bg-gradient-to-b from-[#e67e22] via-[#d35400] to-[#a04000] border-amber-300 text-amber-100 shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)] active:translate-y-0.5 cursor-pointer hover:brightness-110'
                : 'bg-stone-800 border-stone-700 text-stone-500 opacity-50 cursor-not-allowed'
            }`}
          >
            <RotateCw className="w-5 h-5 stroke-[2.5]" />
            {/* Usage Counter Badge */}
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 text-stone-950 font-black text-xs flex items-center justify-center shadow border border-stone-900">
              {reshuffleRemaining}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Compact View of Polyomino Matrix inside Tray Slot
 */
const PieceMatrixView: React.FC<{
  matrix: number[][];
  color: any;
  special?: any;
  onCellPointerDown?: (e: React.PointerEvent, r: number, c: number) => void;
}> = ({ matrix, color, special, onCellPointerDown }) => {
  const rows = matrix.length;
  const cols = matrix[0].length;
  // Calculate cell size so large shapes still fit inside slot comfortably
  const maxDim = Math.max(rows, cols);
  const cellSize = maxDim >= 5 ? 14 : maxDim === 4 ? 17 : maxDim === 3 ? 20 : 24;

  return (
    <div
      className="grid gap-[2px]"
      style={{
        gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
      }}
    >
      {matrix.map((row, r) =>
        row.map((cell, c) => (
          <div
            key={`${r}-${c}`}
            onPointerDown={(e) => {
              if (cell === 1 && onCellPointerDown) {
                onCellPointerDown(e, r, c);
              }
            }}
            style={{ width: cellSize, height: cellSize }}
            className="flex items-center justify-center"
          >
            {cell === 1 ? (
              <BlockRenderer color={color} special={special} size={cellSize} />
            ) : (
              <div className="w-full h-full" />
            )}
          </div>
        ))
      )}
    </div>
  );
};
