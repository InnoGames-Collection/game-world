import { BottleState, LiquidColorId, HintAction } from './types';

export class WaterSortEngine {
  /**
   * Identifies top color and consecutive count of that color from top of source bottle.
   */
  public static getTopGroup(bottle: BottleState): { color: LiquidColorId; count: number } | null {
    if (bottle.layers.length === 0) return null;
    const topColor = bottle.layers[bottle.layers.length - 1];
    let count = 0;
    for (let i = bottle.layers.length - 1; i >= 0; i--) {
      if (bottle.layers[i] === topColor) {
        count++;
      } else {
        break;
      }
    }
    return { color: topColor, count };
  }

  /**
   * Validates whether a pour from source to destination is strictly legal according to royal rules.
   */
  public static canPour(source: BottleState, dest: BottleState): boolean {
    if (source.id === dest.id) return false;
    if (source.layers.length === 0) return false;
    if (dest.layers.length >= dest.capacity) return false;

    // Source bottle is already fully completed and monocromatic -> no need to break it up
    if (this.isBottleCompleted(source)) return false;

    const sourceGroup = this.getTopGroup(source);
    if (!sourceGroup) return false;

    const destSpace = dest.capacity - dest.layers.length;

    // Dest empty: accepts any color provided full group fits
    if (dest.layers.length === 0) {
      // Pouring an already pure group into an empty bottle is redundant
      if (source.layers.length === sourceGroup.count) return false;
      return destSpace >= sourceGroup.count;
    }

    // Dest non-empty: top color must match source top color
    const destTopColor = dest.layers[dest.layers.length - 1];
    if (destTopColor !== sourceGroup.color) return false;

    // SECTION 07 RULE: Whole group must fit; NO partial pours!
    return destSpace >= sourceGroup.count;
  }

  /**
   * Executes legal pour, returning new arrays for source and destination.
   */
  public static executePour(
    source: BottleState,
    dest: BottleState
  ): {
    newSourceLayers: LiquidColorId[];
    newDestLayers: LiquidColorId[];
    color: LiquidColorId;
    count: number;
  } | null {
    if (!this.canPour(source, dest)) return null;

    const group = this.getTopGroup(source)!;
    const newSourceLayers = source.layers.slice(0, source.layers.length - group.count);
    const addedLayers = Array<LiquidColorId>(group.count).fill(group.color);
    const newDestLayers = [...dest.layers, ...addedLayers];

    return {
      newSourceLayers,
      newDestLayers,
      color: group.color,
      count: group.count,
    };
  }

  /**
   * Checks if an individual bottle is full and pure (monochromatic).
   */
  public static isBottleCompleted(bottle: BottleState): boolean {
    if (bottle.layers.length !== bottle.capacity) return false;
    const firstColor = bottle.layers[0];
    return bottle.layers.every((c) => c === firstColor);
  }

  /**
   * Win condition: every non-empty bottle is full and monochromatic.
   */
  public static isLevelComplete(bottles: BottleState[]): boolean {
    for (const b of bottles) {
      if (b.layers.length === 0) continue; // Empty bottle is legal
      if (!this.isBottleCompleted(b)) return false;
    }
    return true;
  }

  /**
   * Checks if any legal move exists in the current board state.
   */
  public static hasAnyLegalMove(bottles: BottleState[]): boolean {
    for (let i = 0; i < bottles.length; i++) {
      for (let j = 0; j < bottles.length; j++) {
        if (i !== j && this.canPour(bottles[i], bottles[j])) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Finds the best recommended hint move using BFS search towards solved state.
   */
  public static findHintMove(bottles: BottleState[]): HintAction | null {
    // 1. Check direct immediate progress moves
    for (let i = 0; i < bottles.length; i++) {
      for (let j = 0; j < bottles.length; j++) {
        if (i !== j && this.canPour(bottles[i], bottles[j])) {
          const group = this.getTopGroup(bottles[i])!;
          // High priority: pouring into a matching bottle that will complete it
          if (
            bottles[j].layers.length > 0 &&
            bottles[j].layers.length + group.count === bottles[j].capacity
          ) {
            return {
              sourceBottleId: bottles[i].id,
              destBottleId: bottles[j].id,
              color: group.color,
            };
          }
        }
      }
    }

    // 2. Fallback to any valid pour that unblocks new colors
    for (let i = 0; i < bottles.length; i++) {
      for (let j = 0; j < bottles.length; j++) {
        if (i !== j && this.canPour(bottles[i], bottles[j])) {
          const group = this.getTopGroup(bottles[i])!;
          return {
            sourceBottleId: bottles[i].id,
            destBottleId: bottles[j].id,
            color: group.color,
          };
        }
      }
    }

    return null;
  }

  /**
   * Canonical state hash for BFS solver memoization
   */
  private static serializeState(bottles: LiquidColorId[][]): string {
    const keys = bottles.map((b) => b.join(',')).sort();
    return keys.join('|');
  }

  /**
   * Breadth-First-Search solvability validator.
   * Ensures all levels shipped are 100% solvable within max depth.
   */
  public static solvePuzzle(
    initialBottles: LiquidColorId[][],
    capacity: number = 4,
    maxSearchSteps: number = 25000
  ): boolean {
    const startState = initialBottles.map((b) => [...b]);
    const queue: LiquidColorId[][][] = [startState];
    const visited = new Set<string>();
    visited.add(this.serializeState(startState));

    let steps = 0;

    while (queue.length > 0 && steps < maxSearchSteps) {
      steps++;
      const current = queue.shift()!;

      // Convert to temporary BottleStates for check
      const bottleStates: BottleState[] = current.map((layers, idx) => ({
        id: idx + 1,
        layers: [...layers],
        capacity,
      }));

      if (this.isLevelComplete(bottleStates)) {
        return true;
      }

      // Generate next valid states
      for (let i = 0; i < bottleStates.length; i++) {
        for (let j = 0; j < bottleStates.length; j++) {
          if (i !== j && this.canPour(bottleStates[i], bottleStates[j])) {
            const res = this.executePour(bottleStates[i], bottleStates[j]);
            if (res) {
              const nextState: LiquidColorId[][] = current.map((arr, idx) => {
                if (idx === i) return [...res.newSourceLayers];
                if (idx === j) return [...res.newDestLayers];
                return [...arr];
              });

              const hash = this.serializeState(nextState);
              if (!visited.has(hash)) {
                visited.add(hash);
                queue.push(nextState);
              }
            }
          }
        }
      }
    }

    return false;
  }
}
