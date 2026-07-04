/**
 * GAME ENGINE
 * Central orchestrator for a single puzzle session.
 *
 * Responsibilities:
 *  - Initialize CrosswordGrid + LetterWheel for a given puzzle
 *  - Listen for wordSubmitted events
 *  - Validate words against puzzle + dictionary
 *  - Manage hint expenditure
 *  - Emit game lifecycle events: wordFound, bonusWord, wrongWord, puzzleSolved
 *
 * v2 note: All persistence calls go through the playerState adapter —
 * swap playerState.js for a Firebase adapter and nothing here changes.
 */

import { CrosswordGrid }           from './crosswordGrid.js';
import { LetterWheel }             from './letterWheel.js';
import { generateCrossword, extractWheelLetters } from './crosswordGenerator.js';
import { DICTIONARY }              from '../data/dictionary.js';
import { playerState }             from '../state/playerState.js';

export class GameEngine {
  /**
   * @param {{
   *   gridContainer:   HTMLElement,
   *   wheelContainer:  HTMLElement,
   *   clueContainer:   HTMLElement,
   *   progressEl:      HTMLElement,
   *   onWordFound:     (word: string, clue: string) => void,
   *   onBonusWord:     (word: string, coins: number) => void,
   *   onWrongWord:     (word: string) => void,
   *   onProgress:      (fraction: number) => void,
   *   onSolved:        (stats: object) => void,
   * }} opts
   */
  constructor(opts) {
    this.opts         = opts;
    this.grid         = null;
    this.wheel        = null;
    this.layout       = null;
    this.destination  = null;
    this.startTime    = null;
    this.foundCount   = 0;
    this.bonusCount   = 0;
    this._boundSubmit = this._onWordSubmitted.bind(this);
  }

  // ─── Load a puzzle ───────────────────────────────────────────────────────
  /**
   * @param {{ id: string, name: string, flag: string, words: Record<string,string>, packId: string }} destination
   * @param {number} [targetWords=7]
   */
  load(destination, targetWords = 7) {
    this.destination = destination;
    this.startTime   = Date.now();
    this.foundCount  = 0;
    this.bonusCount  = 0;

    // Generate crossword layout
    this.layout = generateCrossword(destination.words, targetWords);

    // Render grid
    if (this.grid) {
      this.opts.gridContainer.innerHTML = '';
    }
    this.grid = new CrosswordGrid(this.opts.gridContainer, this.layout);

    // Build wheel letters from placed words
    const wheelLetters = extractWheelLetters(this.layout.words, 8);

    // Render wheel
    if (this.wheel) {
      this.opts.wheelContainer.removeEventListener('wordSubmitted', this._boundSubmit);
      this.wheel.destroy();
    }
    this.wheel = new LetterWheel(this.opts.wheelContainer, wheelLetters);
    this.opts.wheelContainer.addEventListener('wordSubmitted', this._boundSubmit);

    // Render clues
    this._renderClues();

    // Initial progress
    this.opts.onProgress?.(0);
  }

  // ─── Word validation ─────────────────────────────────────────────────────
  _onWordSubmitted(e) {
    const { word } = e.detail;
    const upper    = word.toUpperCase();

    // Already found?
    if (this.grid.filledWords.has(upper)) {
      this.wheel.showError();
      return;
    }

    // Required puzzle word?
    const puzzleWord = this.layout.words.find(w => w.word === upper);
    if (puzzleWord) {
      this.grid.fillWord(upper);
      this.wheel.showSuccess();
      this.foundCount++;

      // Update clue list
      this._renderClues();

      // Update progress bar
      const progress = this.grid.getProgress();
      this.opts.onProgress?.(progress);
      this.opts.onWordFound?.(upper, puzzleWord.clue);

      // Award coins
      const coins = upper.length * 5;
      playerState.earnCoins(coins);

      // Check solved
      if (this.grid.isSolved()) {
        this._onSolved();
      }
      return;
    }

    // Bonus word from dictionary?
    if (upper.length >= 3 && DICTIONARY.has(upper)) {
      this.wheel.showBonus();
      this.bonusCount++;
      const coins = upper.length * 3;
      playerState.earnCoins(coins);
      this.opts.onBonusWord?.(upper, coins);
      return;
    }

    // Not a valid word
    this.wheel.showError();
    this.opts.onWrongWord?.(upper);
  }

  _onSolved() {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const stars   = this._calcStars(elapsed, this.foundCount);

    this.grid.playSolveEffect();

    playerState.completeDestination(this.destination.id, stars);

    this.opts.onSolved?.({
      destination: this.destination,
      elapsed,
      stars,
      foundCount:  this.foundCount,
      bonusCount:  this.bonusCount,
      totalWords:  this.layout.words.length,
    });
  }

  _calcStars(elapsed, found) {
    const total = this.layout.words.length;
    if (found === total && elapsed < 60)  return 3;
    if (found === total && elapsed < 180) return 2;
    return 1;
  }

  // ─── Hints ───────────────────────────────────────────────────────────────

  /**
   * Reveal one letter in the longest unsolved word
   * @returns {boolean} success
   */
  useLetterHint() {
    if (!playerState.canUseHint()) return false;

    const unsolved = this.layout.words
      .filter(w => !this.grid.filledWords.has(w.word))
      .sort((a, b) => b.word.length - a.word.length);

    if (unsolved.length === 0) return false;

    const revealed = this.grid.revealOneLetter(unsolved[0].word);
    if (revealed) {
      playerState.useHint();
      this._renderClues();
    }
    return revealed;
  }

  /**
   * Reveal an entire word (costs 3 hints)
   * @returns {boolean} success
   */
  useWordHint() {
    if (!playerState.canUseHints(3)) return false;

    const unsolved = this.layout.words
      .filter(w => !this.grid.filledWords.has(w.word))
      .sort((a, b) => a.word.length - b.word.length); // shortest first

    if (unsolved.length === 0) return false;

    const word = unsolved[0];
    this.grid.fillWord(word.word, true);
    playerState.useHints(3);
    this.foundCount++;

    this._renderClues();
    this.opts.onProgress?.(this.grid.getProgress());
    this.opts.onWordFound?.(word.word, word.clue);

    if (this.grid.isSolved()) {
      this._onSolved();
    }
    return true;
  }

  // ─── Clue Panel ──────────────────────────────────────────────────────────
  _renderClues() {
    const container = this.opts.clueContainer;
    if (!container) return;

    const clues = this.grid.getClues();
    container.innerHTML = `
      <div class="clue-panel">
        <div class="clue-panel__header">Clues</div>
        <div class="clue-list">
          ${clues.map(c => `
            <div class="clue-item ${c.found ? 'found' : ''}">
              <span class="clue-item__num">${c.number}</span>
              <span class="clue-item__dir">${c.direction === 'across' ? '→' : '↓'}</span>
              <span>${c.clue}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ─── Cleanup ─────────────────────────────────────────────────────────────
  destroy() {
    if (this.opts.wheelContainer) {
      this.opts.wheelContainer.removeEventListener('wordSubmitted', this._boundSubmit);
    }
    this.wheel?.destroy();
    this.grid  = null;
    this.wheel = null;
  }
}
