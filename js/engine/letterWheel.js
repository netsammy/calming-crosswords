/**
 * LETTER WHEEL
 * Renders a circular letter wheel and handles swipe/drag input.
 *
 * Emits a custom event: 'wordSubmitted' on the container element
 * with { detail: { word: string } }
 *
 * Design notes for v2 migration:
 *  - All game state is owned by GameEngine; LetterWheel is purely presentational + input
 *  - No direct localStorage access here
 */

import { soundManager } from './soundManager.js';

export class LetterWheel {
  /**
   * @param {HTMLElement} container  - Element to render into
   * @param {string[]} letters       - Array of uppercase letter strings
   */
  constructor(container, letters) {
    this.container    = container;
    this.letters      = letters;
    this.selected     = [];   // indices of currently-selected letters
    this.isTracking   = false;
    this.svgEl        = null;
    this.letterEls    = [];
    this.pathPoints   = [];   // [{x,y}] for the SVG line

    this._render();
    this._bindEvents();
  }

  // ─── Render ──────────────────────────────────────────────────────────────
  _render() {
    this.container.innerHTML = `
      <div class="word-display" id="word-display">
        <span class="word-display__placeholder">Swipe to spell</span>
      </div>
      <div class="wheel-container" id="wheel-container">
        <svg class="wheel-svg-overlay" id="wheel-svg" viewBox="0 0 300 300" preserveAspectRatio="xMidYMid meet">
          <polyline class="swipe-line" id="swipe-line" points=""/>
        </svg>
        <div class="wheel-center" id="wheel-center">✦</div>
      </div>
      <div style="display:flex; gap: var(--sp-3); align-items: center;">
        <button class="shuffle-btn" id="shuffle-btn">
          <span class="icon">⟳</span> Shuffle
        </button>
      </div>
    `;

    this.wordDisplayEl = this.container.querySelector('#word-display');
    this.wheelEl       = this.container.querySelector('#wheel-container');
    this.svgEl         = this.container.querySelector('#wheel-svg');
    this.lineEl        = this.container.querySelector('#swipe-line');
    this.shuffleBtn    = this.container.querySelector('#shuffle-btn');

    this._placeLetters();
  }

  _placeLetters() {
    // Remove existing letter buttons
    this.wheelEl.querySelectorAll('.wheel-letter').forEach(el => el.remove());
    this.letterEls = [];

    const n = this.letters.length;

    this.letters.forEach((letter, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2; // start at top
      const wheelRadius = this._getWheelRadius();
      const cx = 150 + wheelRadius * Math.cos(angle);
      const cy = 150 + wheelRadius * Math.sin(angle);

      const btn = document.createElement('button');
      btn.className = 'wheel-letter';
      btn.textContent = letter;
      btn.dataset.index = i;
      btn.dataset.letter = letter;
      // Position is set as % of SVG viewBox (300×300) mapped to container size
      btn.style.left = `${(cx / 300) * 100}%`;
      btn.style.top  = `${(cy / 300) * 100}%`;

      this.wheelEl.appendChild(btn);
      this.letterEls.push(btn);
    });
  }

  _getWheelRadius() {
    // Returns radius in SVG units (viewBox 300×300)
    const n = this.letters.length;
    if (n <= 6)  return 95;
    if (n <= 8)  return 100;
    if (n <= 10) return 105;
    return 108;
  }

  // ─── Events ──────────────────────────────────────────────────────────────
  _bindEvents() {
    const wheel = this.wheelEl;

    wheel.addEventListener('pointerdown', e => this._onPointerDown(e));
    wheel.addEventListener('pointermove', e => this._onPointerMove(e));
    wheel.addEventListener('pointerup',   e => this._onPointerUp(e));
    wheel.addEventListener('pointercancel', () => this._reset());

    this.shuffleBtn.addEventListener('click', () => this._shuffle());
  }

  _onPointerDown(e) {
    const letterEl = e.target.closest('.wheel-letter');
    if (!letterEl) return;

    e.preventDefault();
    this.wheelEl.setPointerCapture(e.pointerId);
    this.isTracking = true;
    this.selected   = [];
    this.pathPoints = [];

    this._selectLetter(letterEl);
  }

  _onPointerMove(e) {
    if (!this.isTracking) return;
    e.preventDefault();

    // Hit-test each letter button
    const pt = this._clientToSVG(e.clientX, e.clientY);

    for (const el of this.letterEls) {
      const idx = parseInt(el.dataset.index);
      if (this.selected.includes(idx)) continue;

      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top  + rect.height / 2;
      const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);

      if (dist < rect.width * 0.65) {
        this._selectLetter(el);
      }
    }

    // Update SVG line to current pointer position
    this._updateLine([...this.pathPoints, pt]);
  }

  _onPointerUp(e) {
    if (!this.isTracking) return;
    this.isTracking = false;
    this._submitWord();
  }

  _selectLetter(el) {
    const idx = parseInt(el.dataset.index);
    this.selected.push(idx);
    el.classList.add('selected');
    soundManager.tick(this.selected.length);

    const rect = el.getBoundingClientRect();
    const containerRect = this.svgEl.getBoundingClientRect();
    const svgW = containerRect.width;
    const svgH = containerRect.height;
    const x = ((rect.left + rect.width  / 2 - containerRect.left) / svgW) * 300;
    const y = ((rect.top  + rect.height / 2 - containerRect.top)  / svgH) * 300;

    this.pathPoints.push({ x, y });
    this._updateLine(this.pathPoints);
    this._updateWordDisplay();
  }

  _updateWordDisplay() {
    const word = this._currentWord();
    this.wordDisplayEl.innerHTML = '';
    this.wordDisplayEl.className = 'word-display';

    if (word.length === 0) {
      const ph = document.createElement('span');
      ph.className = 'word-display__placeholder';
      ph.textContent = 'Swipe to spell';
      this.wordDisplayEl.appendChild(ph);
    } else {
      word.split('').forEach(ch => {
        const span = document.createElement('span');
        span.className = 'word-display__letter';
        span.textContent = ch;
        this.wordDisplayEl.appendChild(span);
      });
    }
  }

  _updateLine(points) {
    if (points.length < 2) {
      this.lineEl.setAttribute('points', '');
      return;
    }
    const pts = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    this.lineEl.setAttribute('points', pts);
  }

  _submitWord() {
    const word = this._currentWord();
    if (word.length >= 3) {
      this.container.dispatchEvent(new CustomEvent('wordSubmitted', {
        detail: { word },
        bubbles: true,
      }));
    }
    this._reset();
  }

  _reset() {
    this.isTracking = false;
    this.selected   = [];
    this.pathPoints = [];
    this.letterEls.forEach(el => el.classList.remove('selected'));
    this.lineEl.setAttribute('points', '');
    this._updateWordDisplay();
  }

  _currentWord() {
    return this.selected.map(i => this.letters[i]).join('');
  }

  _clientToSVG(clientX, clientY) {
    const rect = this.svgEl.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width)  * 300,
      y: ((clientY - rect.top)  / rect.height) * 300,
    };
  }

  // ─── Shuffle ─────────────────────────────────────────────────────────────
  _shuffle() {
    for (let i = this.letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.letters[i], this.letters[j]] = [this.letters[j], this.letters[i]];
    }
    this._placeLetters();
    this._reset();
  }

  // ─── Public API ──────────────────────────────────────────────────────────

  /**
   * Flash word display red (wrong word feedback)
   */
  showError() {
    this.wordDisplayEl.classList.add('is-invalid');
    setTimeout(() => this.wordDisplayEl.classList.remove('is-invalid'), 500);
  }

  /**
   * Flash word display green (correct word)
   */
  showSuccess() {
    this.wordDisplayEl.classList.add('is-valid');
    setTimeout(() => this.wordDisplayEl.classList.remove('is-valid'), 600);
  }

  /**
   * Flash word display gold (bonus word found)
   */
  showBonus() {
    this.wordDisplayEl.classList.add('is-bonus');
    setTimeout(() => this.wordDisplayEl.classList.remove('is-bonus'), 600);
  }

  /**
   * Replace letters (e.g. when loading a new puzzle)
   */
  setLetters(letters) {
    this.letters = letters;
    this._placeLetters();
    this._reset();
  }

  destroy() {
    this.container.innerHTML = '';
  }
}
