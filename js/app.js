/**
 * CALMING CROSSWORDS — Main Application
 * Wires all screens, engine, state, and router together.
 */

import { Router }        from './ui/router.js';
import { GameEngine }    from './engine/gameEngine.js';
import { playerState }   from './state/playerState.js';
import { levelManager }  from './state/levelManager.js';
import { soundManager }  from './engine/soundManager.js';
import { showToast, launchConfetti } from './ui/utils.js';
import { getDestination, getPack }   from './data/wordLists.js';

// ─── DOM References ─────────────────────────────────────────────────────────
const screens = {
  home:   document.getElementById('screen-home'),
  levels: document.getElementById('screen-levels'),
  game:   document.getElementById('screen-game'),
  result: document.getElementById('screen-result'),
};

let engine = null;
let router = null;

// ─── Boot ────────────────────────────────────────────────────────────────────
async function boot() {
  const loading = document.getElementById('loading-screen');

  // Wait for fonts to be ready (with a 2s fallback so the app never hangs)
  await Promise.race([
    document.fonts.ready,
    new Promise(r => setTimeout(r, 2000)),
  ]);
  loading.classList.add('hidden');

  // Init sound on first interaction
  document.addEventListener('pointerdown', () => soundManager.enabled = playerState.getSetting('sound'), { once: true });

  // Wire state events → HUD updates
  playerState.on('coinsChanged', ({ coins }) => updateCoinDisplays(coins));
  playerState.on('hintsChanged', ({ hints }) => updateHintDisplays(hints));

  // Start router
  router = new Router({
    home:   () => showScreen('home',   renderHome),
    levels: () => showScreen('levels', renderLevels),
    game:   ({ id }) => showScreen('game', () => renderGame(id)),
    daily:  () => showScreen('game',   () => renderGame(null, true)),
    result: () => showScreen('result', renderResult),
  });
}

// ─── Screen Manager ─────────────────────────────────────────────────────────
function showScreen(name, renderFn) {
  Object.values(screens).forEach(s => s.classList.add('hidden'));
  if (screens[name]) {
    screens[name].classList.remove('hidden');
  }
  // Clear pack theme when not on game screen
  if (name !== 'game') {
    document.getElementById('app').removeAttribute('data-theme');
  }
  renderFn?.();
}

// ─── HOME SCREEN ─────────────────────────────────────────────────────────────
function renderHome() {
  const s = screens.home;
  s.innerHTML = `
    <div class="screen-inner" style="justify-content:center; min-height:100dvh; padding-top: var(--sp-16);">
      <div style="display:flex; flex-direction:column; align-items:center; gap: var(--sp-8); width:100%;">

        <div>
          <div class="home-logo">Calming<br>Crosswords</div>
          <p class="home-tagline">Travel the world, one word at a time</p>
        </div>

        <div style="display:flex; flex-direction:column; align-items:center; gap: var(--sp-3); width:100%;">
          <button class="btn btn--primary btn--lg" id="btn-play" style="width:100%; max-width:280px;">
            ✦ Play Now
          </button>
          <button class="btn btn--ghost" id="btn-daily" style="width:100%; max-width:280px;">
            📅 Daily Challenge
          </button>
          <button class="btn btn--ghost" id="btn-levels" style="width:100%; max-width:280px;">
            🗺️ Destinations
          </button>
        </div>

        <div style="display:flex; gap:var(--sp-6); margin-top: var(--sp-4);">
          <div style="text-align:center;">
            <div style="font-size:var(--text-2xl); font-weight:var(--fw-bold); color:var(--clr-gold-light);">
              ${playerState.coins}
            </div>
            <div style="font-size:var(--text-xs); color:hsla(0,0%,100%,0.5);">Coins</div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:var(--text-2xl); font-weight:var(--fw-bold); color:var(--clr-ocean-pale);">
              ${playerState.hints}
            </div>
            <div style="font-size:var(--text-xs); color:hsla(0,0%,100%,0.5);">Hints</div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:var(--text-2xl); font-weight:var(--fw-bold); color:var(--clr-sage-light);">
              🔥 ${playerState.dailyStreak}
            </div>
            <div style="font-size:var(--text-xs); color:hsla(0,0%,100%,0.5);">Streak</div>
          </div>
        </div>

      </div>
    </div>
  `;

  s.querySelector('#btn-play').addEventListener('click', () => {
    const next = levelManager.getNextDestination();
    if (next) router.go('game', { id: next.id });
    else showToast('All destinations complete! 🎉', 'bonus');
  });

  s.querySelector('#btn-daily').addEventListener('click', () => router.go('daily'));
  s.querySelector('#btn-levels').addEventListener('click', () => router.go('levels'));
}

// ─── LEVELS SCREEN ───────────────────────────────────────────────────────────
function renderLevels() {
  const s = screens.levels;
  const allPacks = levelManager.getAllPackStats();

  s.innerHTML = `
    <div class="screen-inner" style="padding-top: var(--sp-8);">
      <div style="width:100%; display:flex; align-items:center; gap:var(--sp-3); margin-bottom:var(--sp-2);">
        <button class="btn btn--ghost btn--icon" id="btn-back-home">←</button>
        <h1 class="section-heading" style="flex:1">Destinations</h1>
      </div>

      <div style="display:flex; flex-direction:column; gap:var(--sp-4); width:100%;">
        ${allPacks.map(pack => `
          <div class="glass-card" style="padding:var(--sp-4); ${!pack.unlocked ? 'opacity:0.55;' : ''}">
            <div style="display:flex; align-items:center; gap:var(--sp-3); margin-bottom:var(--sp-3);">
              <span style="font-size:28px;">${pack.emoji}</span>
              <div style="flex:1">
                <div style="font-weight:var(--fw-bold); color:var(--clr-white); font-size:var(--text-base);">
                  ${pack.name}
                  ${!pack.unlocked ? '🔒' : ''}
                </div>
                <div style="font-size:var(--text-xs); color:hsla(0,0%,100%,0.5);">
                  ${pack.complete}/${pack.total} destinations · ⭐ ${pack.stars}/${pack.maxStars}
                </div>
              </div>
            </div>
            <div class="progress-bar-wrap">
              <div class="progress-bar-fill" style="width:${pack.total > 0 ? (pack.complete / pack.total * 100).toFixed(0) : 0}%"></div>
            </div>
            ${pack.unlocked ? `
              <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:var(--sp-2); margin-top:var(--sp-3);">
                ${pack.destinations.map(dest => {
                  const done  = playerState.isDestinationComplete(dest.id);
                  const stars = playerState.getStars(dest.id);
                  return `
                    <button
                      class="dest-btn ${done ? 'dest-btn--done' : 'dest-btn--open'}"
                      data-dest="${dest.id}"
                      title="${dest.name}"
                      style="
                        padding:var(--sp-2);
                        border-radius:var(--radius-md);
                        display:flex; flex-direction:column; align-items:center; gap:2px;
                        background:${done ? 'hsla(142,42%,35%,0.35)' : 'hsla(0,0%,100%,0.08)'};
                        border:1px solid ${done ? 'hsla(142,42%,55%,0.4)' : 'hsla(0,0%,100%,0.12)'};
                        transition: transform 0.15s;
                        cursor:pointer;
                      "
                    >
                      <span style="font-size:18px;">${dest.flag}</span>
                      <span style="font-size:var(--text-xs); color:hsla(0,0%,100%,0.7); text-align:center; line-height:1.2;">
                        ${dest.name.split(',')[0]}
                      </span>
                      ${done ? `<span style="font-size:10px;">${'⭐'.repeat(stars)}</span>` : ''}
                    </button>
                  `;
                }).join('')}
              </div>
            ` : `<p style="color:hsla(0,0%,100%,0.4); font-size:var(--text-sm); margin-top:var(--sp-2); text-align:center;">
              Complete 60% of previous pack to unlock
            </p>`}
          </div>
        `).join('')}
      </div>
    </div>
  `;

  s.querySelector('#btn-back-home').addEventListener('click', () => router.go('home'));

  s.querySelectorAll('[data-dest]').forEach(btn => {
    btn.addEventListener('click', () => {
      router.go('game', { id: btn.dataset.dest });
    });
    btn.addEventListener('pointerover', () => btn.style.transform = 'scale(1.06)');
    btn.addEventListener('pointerout',  () => btn.style.transform = '');
  });
}

// ─── GAME SCREEN ─────────────────────────────────────────────────────────────
let lastResult = null;

function renderGame(destId, isDaily = false) {
  // Destroy old engine
  if (engine) {
    engine.destroy();
    engine = null;
  }

  // Get destination
  let destination;
  if (isDaily) {
    const d = levelManager.getDailyChallenge();
    destination = { ...d, packId: d.packId };
  } else {
    const pack = Object.values(levelManager.packs)
      .flatMap(p => p.destinations?.map ? p.destinations.map(dd => ({ ...dd, packId: p.id })) : [])
      .find(d => d.id === destId);

    // Fallback to levelManager
    const allDests = levelManager.packs.flatMap(p =>
      p.destinations.map(d => ({ ...d, packId: p.id, packName: p.name }))
    );
    destination = allDests.find(d => d.id === destId) ?? levelManager.getNextDestination();
  }

  if (!destination) {
    router.go('home');
    return;
  }

  const packInfo = levelManager.packs.find(p => p.id === destination.packId) ?? {};

  // Apply pack-specific theme
  const themeId = (destination.packId || '').replace(/_/g, '-');
  document.getElementById('app').setAttribute('data-theme', themeId);

  // Render game layout
  const s = screens.game;
  s.innerHTML = `
    <div class="screen-inner" style="padding-top: var(--sp-2);">

      <!-- HUD -->
      <div class="hud" style="width:100%;">
        <div class="hud-left">
          <button class="settings-btn" id="btn-game-back" title="Back">←</button>
        </div>
        <div class="hud-center">
          <span class="level-badge">${isDaily ? '📅 Daily Challenge' : packInfo.name ?? ''}</span>
          <span class="pack-name">${destination.flag} ${destination.name}</span>
        </div>
        <div class="hud-right">
          <div class="coin-display">
            <span class="coin-icon">🪙</span>
            <span id="hud-coins">${playerState.coins}</span>
          </div>
          <button class="hint-btn" id="btn-hint">
            💡 <span class="hint-count" id="hud-hints">${playerState.hints}</span>
          </button>
        </div>
      </div>

      <!-- Progress bar -->
      <div class="progress-bar-wrap" style="width:100%; max-width:420px;">
        <div class="progress-bar-fill" id="progress-fill" style="width:0%"></div>
      </div>

      <!-- Words counter -->
      <div class="words-counter">
        <span id="words-counter-text">
          Found <strong id="words-found">0</strong> of <strong id="words-total">?</strong> words
        </span>
      </div>

      <!-- Grid container -->
      <div id="grid-container" class="crossword-wrapper"></div>

      <!-- Wheel container -->
      <div id="wheel-container" class="wheel-section"></div>

      <!-- Clue container -->
      <div id="clue-container" style="width:100%; max-width:420px;"></div>

    </div>
  `;

  // Wire back button
  s.querySelector('#btn-game-back').addEventListener('click', () => {
    if (engine) engine.destroy();
    router.go('home');
  });

  // Wire hint button
  s.querySelector('#btn-hint').addEventListener('click', () => openHintModal());

  // Initialize engine
  engine = new GameEngine({
    gridContainer:  s.querySelector('#grid-container'),
    wheelContainer: s.querySelector('#wheel-container'),
    clueContainer:  s.querySelector('#clue-container'),

    onWordFound(word, clue) {
      soundManager.chime();
      const found = parseInt(s.querySelector('#words-found').textContent) + 1;
      s.querySelector('#words-found').textContent = found;
      showToast(`✓ ${word}`, 'found');
    },

    onBonusWord(word, coins) {
      soundManager.bonus();
      showToast(`+${coins} 🪙  Bonus: ${word}`, 'bonus');
      playerState.incrementBonus();
      updateCoinDisplays(playerState.coins);
    },

    onWrongWord() {
      soundManager.error();
    },

    onProgress(fraction) {
      const pct = (fraction * 100).toFixed(0);
      s.querySelector('#progress-fill').style.width = `${pct}%`;
    },

    onSolved(stats) {
      lastResult = { ...stats, destination, isDaily };
      soundManager.fanfare();
      launchConfetti();
      setTimeout(() => router.go('result'), 1600);
    },
  });

  // Calculate dynamic targetWords based on player progress to ease beginners in
  const completedCount = Object.keys(playerState.snapshot().completedLevels || {}).length;
  let targetWords = 7;
  if (isDaily) {
    targetWords = 7;
  } else if (completedCount < 1) {
    targetWords = 4; // 1st level (very easy, 4 words)
  } else if (completedCount < 3) {
    targetWords = 5; // 2nd & 3rd levels (5 words)
  } else if (completedCount < 6) {
    targetWords = 6; // 4th to 6th levels (6 words)
  }

  engine.load(destination, targetWords);

  // Auto-reveal a free letter on start for the absolute first level to assist beginners
  if (completedCount === 0 && !isDaily) {
    setTimeout(() => {
      const unsolved = engine.layout.words
        .filter(w => !engine.grid.filledWords.has(w.word))
        .sort((a, b) => b.word.length - a.word.length);
      if (unsolved.length > 0) {
        engine.grid.revealOneLetter(unsolved[0].word);
        engine._renderClues();
      }
    }, 800);
  }

  // Update words total after layout generated
  setTimeout(() => {
    const total = engine.layout?.words?.length ?? '?';
    const el = s.querySelector('#words-total');
    if (el) el.textContent = total;
  }, 50);
}

// ─── HINT MODAL ──────────────────────────────────────────────────────────────
function openHintModal() {
  const existing = document.getElementById('hint-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'hint-modal';
  modal.className = 'modal-backdrop';
  modal.innerHTML = `
    <div class="modal-sheet">
      <div class="modal-handle"></div>
      <div class="modal-title">💡 Need a Hint?</div>
      <div class="modal-subtitle">You have ${playerState.hints} hints remaining</div>
      <div class="hint-options">
        <button class="hint-option" id="hint-letter">
          <div class="hint-option__icon">🔤</div>
          <div class="hint-option__text">
            <div class="hint-option__name">Reveal a Letter</div>
            <div class="hint-option__desc">Shows one letter in the longest unsolved word</div>
          </div>
          <div class="hint-option__cost">💡 1</div>
        </button>
        <button class="hint-option" id="hint-word">
          <div class="hint-option__icon">📖</div>
          <div class="hint-option__text">
            <div class="hint-option__name">Reveal a Word</div>
            <div class="hint-option__desc">Reveals the shortest unsolved word</div>
          </div>
          <div class="hint-option__cost">💡 3</div>
        </button>
        <button class="hint-option" id="hint-buy" style="border-color:hsla(42,85%,55%,0.35); background:hsla(42,60%,20%,0.2);">
          <div class="hint-option__icon">🪙</div>
          <div class="hint-option__text">
            <div class="hint-option__name">Buy 5 Hints</div>
            <div class="hint-option__desc">Purchase with coins</div>
          </div>
          <div class="hint-option__cost" style="color:var(--clr-gold-light);">50 🪙</div>
        </button>
      </div>
      <button class="btn btn--ghost" id="hint-close" style="margin-top:var(--sp-2);">Cancel</button>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('#hint-close').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

  modal.querySelector('#hint-letter').addEventListener('click', () => {
    const ok = engine?.useLetterHint();
    if (ok) {
      soundManager.hint();
      updateHintDisplays(playerState.hints);
      showToast('Letter revealed! 💡', 'found');
    } else if (!playerState.canUseHint()) {
      showToast('No hints left! Buy more 🪙', 'error');
    }
    modal.remove();
  });

  modal.querySelector('#hint-word').addEventListener('click', () => {
    const ok = engine?.useWordHint();
    if (ok) {
      soundManager.hint();
      updateHintDisplays(playerState.hints);
      showToast('Word revealed! 💡', 'found');
    } else if (!playerState.canUseHints(3)) {
      showToast('Need 3 hints! Buy more 🪙', 'error');
    }
    modal.remove();
  });

  modal.querySelector('#hint-buy').addEventListener('click', () => {
    const ok = playerState.buyHints(5);
    if (ok) {
      updateHintDisplays(playerState.hints);
      updateCoinDisplays(playerState.coins);
      showToast('5 hints purchased! 💡', 'bonus');
    } else {
      showToast('Not enough coins! 🪙', 'error');
    }
    modal.remove();
  });
}

// ─── RESULT SCREEN ────────────────────────────────────────────────────────────
function renderResult() {
  if (!lastResult) { router.go('home'); return; }

  const { destination, stars, elapsed, foundCount, totalWords, bonusCount, isDaily } = lastResult;
  const s = screens.result;

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

  s.innerHTML = `
    <div class="screen-inner" style="justify-content:center; min-height:100dvh; padding-top:var(--sp-8);">
      <div style="display:flex; flex-direction:column; align-items:center; gap:var(--sp-5); width:100%;">

        <div class="result-stars">
          ${[1,2,3].map(n => `<div class="result-star ${n <= stars ? 'earned' : ''}">⭐</div>`).join('')}
        </div>

        <div style="text-align:center;">
          <div class="result-title">Puzzle Complete!</div>
          <div class="result-destination">${destination.flag} ${destination.name}</div>
        </div>

        <div class="glass-card" style="width:100%; padding:var(--sp-5); display:flex; flex-direction:column; gap:var(--sp-3);">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--sp-3);">
            ${stat('⏱', 'Time', timeStr)}
            ${stat('📝', 'Words', `${foundCount}/${totalWords}`)}
            ${stat('🎁', 'Bonus Words', bonusCount)}
            ${stat('⭐', 'Stars', `${stars}/3`)}
          </div>
        </div>

        ${isDaily ? `
          <div class="daily-badge">📅 Daily Streak: 🔥 ${playerState.dailyStreak} days</div>
        ` : ''}

        <div style="display:flex; flex-direction:column; gap:var(--sp-3); width:100%;">
          <button class="btn btn--primary btn--lg" id="btn-next" style="width:100%;">
            Next Destination →
          </button>
          <div style="display:flex; gap:var(--sp-3);">
            <button class="btn btn--ghost" id="btn-replay" style="flex:1;">↺ Replay</button>
            <button class="btn btn--ghost" id="btn-home-result" style="flex:1;">🏠 Home</button>
          </div>
        </div>

      </div>
    </div>
  `;

  s.querySelector('#btn-next').addEventListener('click', () => {
    const next = levelManager.getNextDestination();
    if (next) router.go('game', { id: next.id });
    else router.go('home');
  });

  s.querySelector('#btn-replay').addEventListener('click', () => {
    router.go('game', { id: destination.id });
  });

  s.querySelector('#btn-home-result').addEventListener('click', () => router.go('home'));
}

function stat(icon, label, value) {
  return `
    <div style="text-align:center; padding:var(--sp-3); background:hsla(0,0%,100%,0.05); border-radius:var(--radius-md);">
      <div style="font-size:24px;">${icon}</div>
      <div style="font-size:var(--text-xl); font-weight:var(--fw-bold); color:var(--clr-white);">${value}</div>
      <div style="font-size:var(--text-xs); color:hsla(0,0%,100%,0.5);">${label}</div>
    </div>
  `;
}

// ─── HUD Sync Helpers ────────────────────────────────────────────────────────
function updateCoinDisplays(coins) {
  document.querySelectorAll('#hud-coins').forEach(el => el.textContent = coins);
}

function updateHintDisplays(hints) {
  document.querySelectorAll('#hud-hints').forEach(el => el.textContent = hints);
}

// ─── Boot ────────────────────────────────────────────────────────────────────
boot();
