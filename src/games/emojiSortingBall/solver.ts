/**
 * EMOJI SORTING BALL - Solvability Verifier & Hint Solver
 * Breadth-First Search (BFS) Solver ensuring 100% verified solvability for every level.
 */

export function isStateSolved(tubes: string[][], capacity: number = 4): boolean {
  for (const tube of tubes) {
    if (tube.length === 0) continue;
    if (tube.length !== capacity) return false;
    const firstEmoji = tube[0];
    for (let k = 1; k < tube.length; k++) {
      if (tube[k] !== firstEmoji) return false;
    }
  }
  return true;
}

export const isEmojiStateSolved = isStateSolved;

export function serializeState(tubes: string[][]): string {
  // Canonical representation (sorted) so tube order permutations don't blow up search space
  return tubes.map((t) => t.join(',')).sort().join('|');
}

export function solveEmojiSortPuzzle(
  initialTubes: string[][],
  capacity: number = 4,
  maxExplored: number = 50000
): { solvable: boolean; minMoves: number } {
  if (isStateSolved(initialTubes, capacity)) {
    return { solvable: true, minMoves: 0 };
  }

  const queue: { state: string[][]; moves: number }[] = [
    { state: initialTubes.map((t) => [...t]), moves: 0 },
  ];
  const visited = new Set<string>();
  visited.add(serializeState(initialTubes));

  let explored = 0;

  while (queue.length > 0 && explored < maxExplored) {
    explored++;
    const current = queue.shift()!;
    const tubes = current.state;

    // Check all tubes
    for (let i = 0; i < tubes.length; i++) {
      if (tubes[i].length === 0) continue;

      // Tube already solved and uniform
      if (
        tubes[i].length === capacity &&
        tubes[i].every((c) => c === tubes[i][0])
      ) {
        continue;
      }

      const movingEmoji = tubes[i][tubes[i].length - 1];

      // Measure contiguous group of matching emoji on top of tube i
      let groupCount = 0;
      for (let k = tubes[i].length - 1; k >= 0; k--) {
        if (tubes[i][k] === movingEmoji) groupCount++;
        else break;
      }

      let emptyTubeVisited = false;

      for (let j = 0; j < tubes.length; j++) {
        if (i === j) continue;
        if (tubes[j].length >= capacity) continue;

        const isDestEmpty = tubes[j].length === 0;

        if (isDestEmpty) {
          // All empty tubes are symmetric: only try one
          if (emptyTubeVisited) continue;
          emptyTubeVisited = true;
          // Moving an entire uniform tube to an empty tube is redundant
          if (tubes[i].length === groupCount) continue;
        } else if (tubes[j][tubes[j].length - 1] !== movingEmoji) {
          continue;
        }

        // Transfer up to available space in tube j
        const availableSpace = capacity - tubes[j].length;
        const countToMove = Math.min(groupCount, availableSpace);

        // Create next state
        const nextTubes = tubes.map((t) => [...t]);
        for (let c = 0; c < countToMove; c++) {
          const ball = nextTubes[i].pop()!;
          nextTubes[j].push(ball);
        }

        if (isStateSolved(nextTubes, capacity)) {
          return { solvable: true, minMoves: current.moves + 1 };
        }

        const serialized = serializeState(nextTubes);
        if (!visited.has(serialized)) {
          visited.add(serialized);
          queue.push({ state: nextTubes, moves: current.moves + 1 });
        }
      }
    }
  }

  return { solvable: false, minMoves: -1 };
}

/**
 * Find the optimal or best immediate next move for the in-game Hint system
 */
export function findNextBestMove(
  initialTubes: string[][],
  capacity: number = 4,
  maxExplored: number = 8000
): { from: number; to: number } | null {
  if (isStateSolved(initialTubes, capacity)) return null;

  interface QueueItem {
    state: string[][];
    firstMove?: { from: number; to: number };
  }

  const queue: QueueItem[] = [{ state: initialTubes.map((t) => [...t]) }];
  const visited = new Set<string>();
  visited.add(serializeState(initialTubes));

  let explored = 0;
  let fallbackMove: { from: number; to: number } | null = null;

  while (queue.length > 0 && explored < maxExplored) {
    explored++;
    const current = queue.shift()!;
    const tubes = current.state;

    for (let i = 0; i < tubes.length; i++) {
      if (tubes[i].length === 0) continue;

      if (
        tubes[i].length === capacity &&
        tubes[i].every((c) => c === tubes[i][0])
      ) {
        continue;
      }

      const movingEmoji = tubes[i][tubes[i].length - 1];
      let groupCount = 0;
      for (let k = tubes[i].length - 1; k >= 0; k--) {
        if (tubes[i][k] === movingEmoji) groupCount++;
        else break;
      }

      let emptyTubeVisited = false;

      for (let j = 0; j < tubes.length; j++) {
        if (i === j) continue;
        if (tubes[j].length >= capacity) continue;

        const isDestEmpty = tubes[j].length === 0;

        if (isDestEmpty) {
          if (emptyTubeVisited) continue;
          emptyTubeVisited = true;
          if (tubes[i].length === groupCount) continue;
        } else if (tubes[j][tubes[j].length - 1] !== movingEmoji) {
          continue;
        }

        const moveStep = { from: i, to: j };
        const thisFirstMove = current.firstMove || moveStep;

        if (!fallbackMove) {
          fallbackMove = thisFirstMove;
        }

        const availableSpace = capacity - tubes[j].length;
        const countToMove = Math.min(groupCount, availableSpace);

        const nextTubes = tubes.map((t) => [...t]);
        for (let c = 0; c < countToMove; c++) {
          const ball = nextTubes[i].pop()!;
          nextTubes[j].push(ball);
        }

        if (isStateSolved(nextTubes, capacity)) {
          return thisFirstMove;
        }

        const serialized = serializeState(nextTubes);
        if (!visited.has(serialized)) {
          visited.add(serialized);
          queue.push({
            state: nextTubes,
            firstMove: thisFirstMove,
          });
        }
      }
    }
  }

  return fallbackMove;
}

export const findNextBestEmojiMove = findNextBestMove;
