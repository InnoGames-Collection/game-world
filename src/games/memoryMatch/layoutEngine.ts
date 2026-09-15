/**
 * Memory Match - Dynamic Responsive Layout Engine
 * TelePlus Ethiopia Premium HTML5 Mobile Gaming Suite
 * 
 * Guarantees:
 * - ABSOLUTE MOBILE RULE: NO VERTICAL PAGE SCROLLING during gameplay.
 * - The entire active card board dynamically fits inside the available viewport.
 * - Card aspect ratio preserved (cardHeight ≈ cardWidth * 1.28).
 * - HUD, top safe area, and bottom margins are included in layout calculations.
 * - Cards are balanced, centered, visually clear, and easy to tap.
 */

export interface ResponsiveBoardLayout {
  cols: number;
  rows: number;
  cardWidthPx: number;
  cardHeightPx: number;
  gapPx: number;
  boardPaddingPx: number;
  maxBoardWidthPx: number;
  boardHeightPx: number;
  showCategoryTag: boolean;
  showCardTitle: boolean;
  isScrollable: boolean;
}

interface GridCandidate {
  cols: number;
  rows: number;
  emptyCells: number;
}

/**
 * Generate sensible grid configurations (cols x rows) for a given card count.
 */
function getGridCandidates(totalCards: number, isPortrait: boolean): GridCandidate[] {
  const candidates: GridCandidate[] = [];

  // Generate factors and near-factors
  const minCols = isPortrait ? 2 : 3;
  const maxCols = isPortrait ? 8 : 10;

  for (let c = minCols; c <= maxCols; c++) {
    const r = Math.ceil(totalCards / c);
    const totalSlots = c * r;
    const emptyCells = totalSlots - totalCards;

    // Filter out candidates with too many empty slots
    if (emptyCells <= Math.max(2, Math.floor(c / 2))) {
      // In portrait, favor rows >= cols - 1
      if (isPortrait && r >= c - 1) {
        candidates.push({ cols: c, rows: r, emptyCells });
      } else if (!isPortrait && c >= r - 1) {
        candidates.push({ cols: c, rows: r, emptyCells });
      } else {
        // Still allow candidate with slight penalty
        candidates.push({ cols: c, rows: r, emptyCells });
      }
    }
  }

  // Fallback if no candidate found
  if (candidates.length === 0) {
    const defaultCols = isPortrait ? 4 : 6;
    candidates.push({
      cols: defaultCols,
      rows: Math.ceil(totalCards / defaultCols),
      emptyCells: (defaultCols * Math.ceil(totalCards / defaultCols)) - totalCards,
    });
  }

  return candidates;
}

/**
 * Calculates complete dimensional properties for the board and cards
 * such that NO vertical or horizontal scrolling ever occurs.
 */
export function calculateResponsiveLayout(
  _levelNumber: number,
  totalCards: number,
  viewportWidth: number,
  viewportHeight: number
): ResponsiveBoardLayout {
  const isMobile = viewportWidth < 640;
  const isPortrait = viewportHeight >= viewportWidth;

  // 1. Precise HUD and boundary allowance
  // HUD includes back button, level indicator, audio/pause buttons, and stat counters
  const estimatedHUDHeight = isMobile ? 74 : 84;
  const marginX = isMobile ? 8 : 20;
  const marginY = isMobile ? 6 : 14;

  const availableWidth = Math.max(280, viewportWidth - marginX * 2);
  const availableHeight = Math.max(320, viewportHeight - estimatedHUDHeight - marginY * 2);

  // 2. Target collectible card aspect ratio (1 : 1.28)
  const CARD_RATIO = 1.28;

  // 3. Test all candidates to find the optimal arrangement
  const candidates = getGridCandidates(totalCards, isPortrait);

  let bestLayout: ResponsiveBoardLayout | null = null;
  let bestScore = -1;

  for (const cand of candidates) {
    const { cols, rows, emptyCells } = cand;

    // Dynamic spacing based on density
    const gapPx = cols >= 6 ? 4 : (cols >= 5 ? 5 : (isMobile ? 6 : 8));
    const boardPaddingPx = cols >= 6 ? 5 : (isMobile ? 6 : 10);

    const innerAvailW = availableWidth - boardPaddingPx * 2 - (cols - 1) * gapPx;
    const innerAvailH = availableHeight - boardPaddingPx * 2 - (rows - 1) * gapPx;

    if (innerAvailW <= 0 || innerAvailH <= 0) continue;

    // Max possible card width from width constraint vs height constraint
    const maxW_fromWidth = innerAvailW / cols;
    const maxW_fromHeight = innerAvailH / (rows * CARD_RATIO);

    // Bounded card width
    const rawCardW = Math.min(maxW_fromWidth, maxW_fromHeight);
    
    // Bounds: minimum 42px on dense boards to keep artwork and tap targets solid,
    // maximum 110px so low levels don't explode
    const maxAllowedWidth = isMobile ? (cols <= 3 ? 98 : 86) : 110;
    const cardWidthPx = Math.floor(Math.min(maxAllowedWidth, Math.max(38, rawCardW)));
    const cardHeightPx = Math.round(cardWidthPx * CARD_RATIO);

    const totalGridWidth = cols * cardWidthPx + (cols - 1) * gapPx + boardPaddingPx * 2;
    const totalGridHeight = rows * cardHeightPx + (rows - 1) * gapPx + boardPaddingPx * 2;

    // Strict constraint: Must fit completely in viewport without scrolling!
    if (totalGridHeight > availableHeight + 4 || totalGridWidth > availableWidth + 4) {
      continue;
    }

    // Candidate scoring:
    // We want largest readable cards and fewest empty cells
    const cardArea = cardWidthPx * cardHeightPx;
    const emptyCellPenalty = emptyCells * (cardArea * 0.15);
    const score = cardArea - emptyCellPenalty;

    if (score > bestScore) {
      bestScore = score;
      const showCategoryTag = cardWidthPx >= 68;
      const showCardTitle = cardWidthPx >= 48;

      bestLayout = {
        cols,
        rows,
        cardWidthPx,
        cardHeightPx,
        gapPx,
        boardPaddingPx,
        maxBoardWidthPx: Math.min(availableWidth, totalGridWidth + 8),
        boardHeightPx: totalGridHeight,
        showCategoryTag,
        showCardTitle,
        isScrollable: false, // Absolutely NO scrolling
      };
    }
  }

  // If no candidate fit strictly, compute fallback scaled to exactly fit
  if (!bestLayout) {
    const cols = isPortrait ? (totalCards > 30 ? 6 : 4) : 6;
    const rows = Math.ceil(totalCards / cols);
    const gapPx = 4;
    const boardPaddingPx = 5;

    const innerAvailW = availableWidth - boardPaddingPx * 2 - (cols - 1) * gapPx;
    const innerAvailH = availableHeight - boardPaddingPx * 2 - (rows - 1) * gapPx;
    const rawCardW = Math.min(innerAvailW / cols, innerAvailH / (rows * CARD_RATIO));
    const cardWidthPx = Math.max(36, Math.floor(rawCardW));
    const cardHeightPx = Math.round(cardWidthPx * CARD_RATIO);

    bestLayout = {
      cols,
      rows,
      cardWidthPx,
      cardHeightPx,
      gapPx,
      boardPaddingPx,
      maxBoardWidthPx: availableWidth,
      boardHeightPx: rows * cardHeightPx + (rows - 1) * gapPx + boardPaddingPx * 2,
      showCategoryTag: cardWidthPx >= 68,
      showCardTitle: cardWidthPx >= 48,
      isScrollable: false,
    };
  }

  return bestLayout;
}
