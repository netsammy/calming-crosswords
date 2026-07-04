/**
 * CROSSWORD GRID
 * Renders the crossword grid as DOM elements and manages cell state.
 */

export class CrosswordGrid {
  /**
   * @param {HTMLElement} container  - Element to render the grid into
   * @param {import('../engine/crosswordGenerator.js').CrosswordLayout} layout
   */
  constructor(container, layout) {
    this.container = container;
    this.layout    = layout;
    this.cellEls   = []; // 2D array of cell DOM elements
    this.filledWords = new Set();
    this._render();
  }

  // ─── Render ────────────────────────────────────────────────
  _render() {
    this.container.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'crossword-grid';
    grid.style.gridTemplateColumns = `repeat(${this.layout.cols}, var(--cell-size))`;
    grid.style.gridTemplateRows    = `repeat(${this.layout.rows}, var(--cell-size))`;

    this.cellEls = [];

    for (let r = 0; r < this.layout.rows; r++) {
      this.cellEls.push([]);
      for (let c = 0; c < this.layout.cols; c++) {
        const letter = this.layout.cells[r][c];
        const el = document.createElement('div');

        if (letter === null) {
          el.className = 'cell cell--void';
        } else {
          el.className = 'cell cell--blank';
          el.dataset.row = r;
          el.dataset.col = c;
          el.dataset.letter = letter;

          // Number label
          const num = this._getNumberAt(r, c);
          if (num !== null) {
            const numEl = document.createElement('span');
            numEl.className = 'cell-number';
            numEl.textContent = num;
            el.appendChild(numEl);
          }
        }

        grid.appendChild(el);
        this.cellEls[r].push(el);
      }
    }

    this.container.appendChild(grid);
    this.gridEl = grid;
  }

  _getNumberAt(row, col) {
    for (const w of this.layout.words) {
      if (w.row === row && w.col === col) return w.number;
    }
    return null;
  }

  // ─── Highlight a word path ──────────────────────────────────
  /**
   * Highlight cells belonging to a word (called during swipe validation preview)
   * @param {string} word
   */
  highlightWord(word) {
    this._clearHighlights();
    const match = this.layout.words.find(w => w.word === word.toUpperCase());
    if (!match) return;
    this._getCellsForWord(match).forEach(el => el.classList.add('cell--highlighted'));
  }

  _clearHighlights() {
    this.gridEl.querySelectorAll('.cell--highlighted').forEach(el =>
      el.classList.remove('cell--highlighted'));
  }

  // ─── Fill a word ───────────────────────────────────────────
  /**
   * Animate-fill a word into the grid
   * @param {string} word
   * @param {boolean} [isHint=false]
   * @returns {boolean} whether the word was found in this layout
   */
  fillWord(word, isHint = false) {
    const match = this.layout.words.find(w => w.word === word.toUpperCase());
    if (!match || this.filledWords.has(word.toUpperCase())) return false;

    this.filledWords.add(word.toUpperCase());
    this._clearHighlights();

    const cells = this._getCellsForWord(match);
    cells.forEach((el, i) => {
      setTimeout(() => {
        el.classList.remove('cell--blank');
        el.classList.add(isHint ? 'cell--hint' : 'cell--filled');
        el.textContent = '';
        const letter = document.createTextNode(match.word[i]);
        el.appendChild(letter);
      }, i * 60);
    });

    return true;
  }

  /**
   * Reveal a single random unfilled letter in a word (hint type: letter reveal)
   * @param {string} word
   * @returns {boolean}
   */
  revealOneLetter(word) {
    const match = this.layout.words.find(w => w.word === word.toUpperCase());
    if (!match) return false;

    const cells = this._getCellsForWord(match);
    const unfilledCells = cells.filter(el => el.classList.contains('cell--blank'));
    if (unfilledCells.length === 0) return false;

    const idx = Math.floor(Math.random() * unfilledCells.length);
    const el  = unfilledCells[idx];
    const r   = parseInt(el.dataset.row);
    const c   = parseInt(el.dataset.col);
    const letter = this.layout.cells[r][c];

    el.classList.remove('cell--blank');
    el.classList.add('cell--hint');
    el.textContent = letter;
    return true;
  }

  // ─── Completion ────────────────────────────────────────────
  /**
   * @returns {boolean} true when all required words are filled
   */
  isSolved() {
    return this.layout.words.every(w => this.filledWords.has(w.word));
  }

  /**
   * Progress as 0–1 fraction
   */
  getProgress() {
    return this.filledWords.size / this.layout.words.length;
  }

  // ─── Internal ─────────────────────────────────────────────
  _getCellsForWord(placedWord) {
    const cells = [];
    for (let i = 0; i < placedWord.word.length; i++) {
      const r = placedWord.direction === 'down'   ? placedWord.row + i : placedWord.row;
      const c = placedWord.direction === 'across' ? placedWord.col + i : placedWord.col;
      if (this.cellEls[r] && this.cellEls[r][c]) {
        cells.push(this.cellEls[r][c]);
      }
    }
    return cells;
  }

  /**
   * Get clue list in numbered order
   * @returns {{ number: number, word: string, clue: string, direction: string, found: boolean }[]}
   */
  getClues() {
    return this.layout.words
      .slice()
      .sort((a, b) => a.number - b.number || (a.direction === 'across' ? -1 : 1))
      .map(w => ({
        number:    w.number,
        word:      w.word,
        clue:      w.clue,
        direction: w.direction,
        found:     this.filledWords.has(w.word),
      }));
  }

  /**
   * Flash all cells with a solve effect
   */
  playSolveEffect() {
    const allCells = this.gridEl.querySelectorAll('.cell--filled, .cell--hint');
    allCells.forEach((el, i) => {
      setTimeout(() => {
        el.classList.add('cell--word-complete');
        setTimeout(() => el.classList.remove('cell--word-complete'), 1000);
      }, i * 30);
    });
  }
}
