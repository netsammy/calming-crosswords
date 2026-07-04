/**
 * CROSSWORD GENERATOR
 * Auto-generates a valid crossword layout from a word list.
 *
 * Algorithm:
 *  1. Sort words by length (longest first) — better coverage
 *  2. Place the first word horizontally at center
 *  3. For each remaining word, try to intersect with an already-placed word
 *     at every possible shared letter position
 *  4. Score placements by number of intersections (prefer more crossings)
 *  5. Accept best-scored valid placement (no out-of-bounds, no conflicts)
 *  6. Repeat until all words placed or no placement found (skip word)
 *  7. Normalize grid coordinates to start at (0,0)
 */

const MAX_GRID = 25; // Max grid dimension
const CENTER   = Math.floor(MAX_GRID / 2);

/**
 * @typedef {{ word: string, clue: string, row: number, col: number, direction: 'across'|'down', number: number }} PlacedWord
 * @typedef {{ rows: number, cols: number, cells: string[][], words: PlacedWord[] }} CrosswordLayout
 */

/**
 * Generate a crossword layout from a word/clue map.
 * @param {Record<string, string>} wordClueMap  { WORD: 'clue', ... }
 * @param {number} [targetWords=8]  How many words to include
 * @returns {CrosswordLayout}
 */
export function generateCrossword(wordClueMap, targetWords = 8) {
  // 1. Prepare word list — filter short/long, sort by length desc
  const candidates = Object.entries(wordClueMap)
    .map(([w, clue]) => ({ word: w.toUpperCase(), clue }))
    .filter(({ word }) => word.length >= 3 && word.length <= 15 && /^[A-Z]+$/.test(word))
    .sort((a, b) => b.word.length - a.word.length);

  const target = Math.min(targetWords, candidates.length);

  // 2. Initialize empty grid
  let grid = createGrid();
  let placed = []; // PlacedWord[]

  // 3. Place first word horizontally at center
  const first = candidates[0];
  const startCol = CENTER - Math.floor(first.word.length / 2);
  placeWord(grid, first.word, CENTER, startCol, 'across');
  placed.push({
    word:      first.word,
    clue:      first.clue,
    row:       CENTER,
    col:       startCol,
    direction: 'across',
    number:    1,
  });

  // 4. Try to place remaining words
  const remaining = candidates.slice(1);
  let attempts = 0;
  const maxAttempts = remaining.length * 3;

  while (placed.length < target && remaining.length > 0 && attempts < maxAttempts) {
    attempts++;
    let bestPlacement = null;
    let bestScore = -1;
    let bestIdx = -1;

    // Try each unplaced word
    for (let wi = 0; wi < remaining.length; wi++) {
      const candidate = remaining[wi];
      const placements = findPlacements(grid, candidate.word, placed);

      for (const p of placements) {
        if (p.score > bestScore) {
          bestScore = p.score;
          bestPlacement = { ...p, word: candidate.word, clue: candidate.clue };
          bestIdx = wi;
        }
      }
    }

    if (bestPlacement && bestScore >= 0) {
      placeWord(grid, bestPlacement.word, bestPlacement.row, bestPlacement.col, bestPlacement.direction);
      placed.push({
        word:      bestPlacement.word,
        clue:      bestPlacement.clue,
        row:       bestPlacement.row,
        col:       bestPlacement.col,
        direction: bestPlacement.direction,
        number:    placed.length + 1,
      });
      remaining.splice(bestIdx, 1);
    } else {
      // No valid placement found for any remaining word, move on
      break;
    }
  }

  // 5. Normalize & calculate word numbers in reading order
  return normalizeLayout(grid, placed);
}

// ─────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────

function createGrid() {
  return Array.from({ length: MAX_GRID }, () => Array(MAX_GRID).fill(null));
}

function placeWord(grid, word, row, col, direction) {
  for (let i = 0; i < word.length; i++) {
    if (direction === 'across') {
      grid[row][col + i] = word[i];
    } else {
      grid[row + i][col] = word[i];
    }
  }
}

/**
 * Find all valid placements for `word` given already-placed words.
 * A placement is valid if:
 *  - It intersects at least one shared letter
 *  - No out-of-bounds
 *  - No conflicting letters adjacent or overlapping
 */
function findPlacements(grid, word, placed) {
  const placements = [];

  for (const pw of placed) {
    const perpDir = pw.direction === 'across' ? 'down' : 'across';

    // Find shared letters between pw.word and word
    for (let pi = 0; pi < pw.word.length; pi++) {
      const sharedLetter = pw.word[pi];

      for (let wi = 0; wi < word.length; wi++) {
        if (word[wi] !== sharedLetter) continue;

        // Compute placement coordinates
        let row, col;
        if (pw.direction === 'across') {
          // New word goes down; intersection at pw row, pw col+pi
          col = pw.col + pi;
          row = pw.row - wi;
        } else {
          // New word goes across; intersection at pw row+pi, pw col
          row = pw.row + pi;
          col = pw.col - wi;
        }

        if (isValidPlacement(grid, word, row, col, perpDir)) {
          const score = scorePlacement(grid, word, row, col, perpDir);
          placements.push({ row, col, direction: perpDir, score });
        }
      }
    }
  }

  return placements;
}

function isValidPlacement(grid, word, row, col, direction) {
  const endRow = direction === 'down'   ? row + word.length - 1 : row;
  const endCol = direction === 'across' ? col + word.length - 1 : col;

  // Check bounds
  if (row < 1 || col < 1 || endRow >= MAX_GRID - 1 || endCol >= MAX_GRID - 1) return false;

  // Check cell-by-cell
  for (let i = 0; i < word.length; i++) {
    const r = direction === 'down'   ? row + i : row;
    const c = direction === 'across' ? col + i : col;
    const letter = word[i];

    const cell = grid[r][c];

    if (cell !== null && cell !== letter) return false; // Conflict

    // Check adjacency (prevent parallel words touching)
    if (cell === null) {
      if (direction === 'across') {
        // Check above and below
        if (grid[r - 1][c] !== null || grid[r + 1][c] !== null) return false;
      } else {
        // Check left and right
        if (grid[r][c - 1] !== null || grid[r][c + 1] !== null) return false;
      }
    }
  }

  // Check cells before/after word (no extension of another word)
  if (direction === 'across') {
    if (grid[row][col - 1] !== null || grid[row][endCol + 1] !== null) return false;
  } else {
    if (grid[row - 1][col] !== null || grid[endRow + 1][col] !== null) return false;
  }

  return true;
}

function scorePlacement(grid, word, row, col, direction) {
  let intersections = 0;
  for (let i = 0; i < word.length; i++) {
    const r = direction === 'down'   ? row + i : row;
    const c = direction === 'across' ? col + i : col;
    if (grid[r][c] !== null) intersections++;
  }
  return intersections; // higher = better
}

/**
 * Crop grid to used area, normalize word coordinates, assign clue numbers
 */
function normalizeLayout(grid, placed) {
  // Find bounding box
  let minRow = MAX_GRID, maxRow = 0, minCol = MAX_GRID, maxCol = 0;
  for (let r = 0; r < MAX_GRID; r++) {
    for (let c = 0; c < MAX_GRID; c++) {
      if (grid[r][c] !== null) {
        minRow = Math.min(minRow, r);
        maxRow = Math.max(maxRow, r);
        minCol = Math.min(minCol, c);
        maxCol = Math.max(maxCol, c);
      }
    }
  }

  // Add 1-cell padding
  minRow = Math.max(0, minRow - 1);
  minCol = Math.max(0, minCol - 1);
  maxRow = Math.min(MAX_GRID - 1, maxRow + 1);
  maxCol = Math.min(MAX_GRID - 1, maxCol + 1);

  const rows = maxRow - minRow + 1;
  const cols = maxCol - minCol + 1;

  // Crop the grid
  const cells = [];
  for (let r = minRow; r <= maxRow; r++) {
    cells.push(grid[r].slice(minCol, maxCol + 1));
  }

  // Re-map placed word coords
  const normalizedWords = placed.map(pw => ({
    ...pw,
    row: pw.row - minRow,
    col: pw.col - minCol,
  }));

  // Assign clue numbers (reading order: top→bottom, left→right)
  assignNumbers(normalizedWords, cells, rows, cols);

  return { rows, cols, cells, words: normalizedWords };
}

/**
 * Assign sequential numbers to word-start cells in reading order
 */
function assignNumbers(words, cells, rows, cols) {
  // Find all start positions
  const startCells = new Map(); // "r,c" → number
  let num = 1;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (cells[r][c] === null) continue;

      const startsAcross = c === 0 || cells[r][c - 1] === null;
      const startsDown   = r === 0 || cells[r - 1][c] === null;
      const isAcrossWord = startsAcross && c + 1 < cols && cells[r][c + 1] !== null;
      const isDownWord   = startsDown   && r + 1 < rows && cells[r + 1][c] !== null;

      if (isAcrossWord || isDownWord) {
        startCells.set(`${r},${c}`, num++);
      }
    }
  }

  // Apply to words
  for (const word of words) {
    const key = `${word.row},${word.col}`;
    if (startCells.has(key)) {
      word.number = startCells.get(key);
    }
  }
}

/**
 * Extract the letter wheel letters from placed words.
 * Returns a shuffled array of unique letters used in the puzzle.
 * @param {PlacedWord[]} words
 * @param {number} [minLetters=7]
 * @returns {string[]}
 */
export function extractWheelLetters(words, minLetters = 7) {
  const allLetters = words.flatMap(w => w.word.split(''));
  const unique = [...new Set(allLetters)];

  // Shuffle
  for (let i = unique.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unique[i], unique[j]] = [unique[j], unique[i]];
  }

  // Pad if fewer than minLetters
  const alphabet = 'AEIOULNRST';
  let i = 0;
  while (unique.length < minLetters) {
    const extra = alphabet[i++ % alphabet.length];
    if (!unique.includes(extra)) unique.push(extra);
  }

  return unique.slice(0, Math.max(minLetters, unique.length));
}
