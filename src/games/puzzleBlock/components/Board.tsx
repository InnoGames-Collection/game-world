/**
 * 10x10 Wooden Puzzle Board Component
 * Features authentic checkerboard grid, copper/wood beveled frame, and placement ghost previews.
 */

import React from 'react';
import { GridCell, PolyominoShape } from '../types';
import { BlockRenderer } from '../blockRenderer';

interface BoardProps {
  grid: GridCell[][];
  boardSizePx: number;
  hoverPos: { row: number; col: number } | null;
  draggedShape: PolyominoShape | null;
  isValidHover: boolean;
  clearingCells: Set<string>; // 'r-c' keys of clearing lines
}

export const Board: React.FC<BoardProps> = ({
  grid,
  boardSizePx,
  hoverPos,
  draggedShape,
  isValidHover,
  clearingCells,
}) => {
  const cellSize = Math.floor((boardSizePx - 24) / 10);
  const actualBoardSize = cellSize * 10 + 24;

  // Compute ghost occupied coordinates
  const ghostCoords = React.useMemo(() => {
    if (!hoverPos || !draggedShape) return new Set<string>();
    const coords = new Set<string>();
    for (let r = 0; r < draggedShape.matrix.length; r++) {
      for (let c = 0; c < draggedShape.matrix[r].length; c++) {
        if (draggedShape.matrix[r][c] === 1) {
          const targetR = hoverPos.row + r;
          const targetC = hoverPos.col + c;
          if (targetR >= 0 && targetR < 10 && targetC >= 0 && targetC < 10) {
            coords.add(`${targetR}-${targetC}`);
          }
        }
      }
    }
    return coords;
  }, [hoverPos, draggedShape]);

  return (
    <div
      id="puzzle-block-board-container"
      className="relative flex items-center justify-center p-3 select-none"
      style={{ width: actualBoardSize, height: actualBoardSize }}
    >
      {/* 3D Elevated Wooden Outer Frame with Bevel & Rivets */}
      <div
        className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#8c4322] via-[#6e2f15] to-[#451808] border-2 border-[#d97c38] shadow-[0_12px_28px_rgba(0,0,0,0.7),inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-3px_6px_rgba(0,0,0,0.8)] pointer-events-none"
      >
        {/* Frame Corner Golden Rivets */}
        <div className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 shadow-[0_1px_2px_#000]" />
        <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 shadow-[0_1px_2px_#000]" />
        <div className="absolute bottom-1.5 left-1.5 w-2 h-2 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 shadow-[0_1px_2px_#000]" />
        <div className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 shadow-[0_1px_2px_#000]" />
      </div>

      {/* Recessed 10x10 Playfield Canvas with Checkerboard */}
      <div
        id="puzzle-block-grid"
        className="relative rounded-xl overflow-hidden bg-[#240c07] shadow-[inset_0_4px_12px_rgba(0,0,0,0.85)] border border-[#522010]"
        style={{
          width: cellSize * 10,
          height: cellSize * 10,
          display: 'grid',
          gridTemplateColumns: `repeat(10, ${cellSize}px)`,
          gridTemplateRows: `repeat(10, ${cellSize}px)`,
        }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const cellKey = `${r}-${c}`;
            const isChecker = (r + c) % 2 === 1;
            const isGhost = ghostCoords.has(cellKey);
            const isClearing = clearingCells.has(cellKey);

            return (
              <div
                key={cellKey}
                data-row={r}
                data-col={c}
                className={`relative flex items-center justify-center border border-[#3d160b]/40 transition-colors duration-150 ${
                  isChecker ? 'bg-[#331109]' : 'bg-[#290d07]'
                }`}
                style={{ width: cellSize, height: cellSize }}
              >
                {/* Subtle cell inner bevel */}
                <div className="absolute inset-0 border-t border-l border-white/[0.03] pointer-events-none" />

                {/* Pre-existing / Placed Block */}
                {cell.occupied && !isClearing && (
                  <div className="w-full h-full p-[1px] animate-in zoom-in-90 duration-150">
                    <BlockRenderer
                      color={cell.color}
                      blocker={cell.blocker}
                      iceHits={cell.iceHits}
                      special={cell.special}
                      size={cellSize - 2}
                    />
                  </div>
                )}

                {/* Clearing Animation Flash */}
                {isClearing && (
                  <div className="w-full h-full p-[1px] animate-pulse">
                    <div
                      className="w-full h-full rounded-md bg-white shadow-[0_0_12px_#fff] scale-105 duration-200"
                      style={{ width: cellSize - 2, height: cellSize - 2 }}
                    />
                  </div>
                )}

                {/* Dragged Shape Ghost Preview */}
                {isGhost && (
                  <div className="w-full h-full p-[1px] z-20">
                    <BlockRenderer
                      isGhost={true}
                      isValidGhost={isValidHover}
                      size={cellSize - 2}
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
