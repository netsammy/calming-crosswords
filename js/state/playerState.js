/**
 * PLAYER STATE
 * Manages all persistent player data via localStorage.
 *
 * ─── v2 Migration Path ───────────────────────────────────────────────────
 * In v2, replace the localStorage calls below with Firebase Firestore reads/writes.
 * The public API surface is identical — no changes needed in GameEngine or UI.
 *
 * Suggested v2 adapter pattern:
 *   import { playerState } from './playerStateFirebase.js'; // same API
 * ─────────────────────────────────────────────────────────────────────────
 */

const STORAGE_KEY = 'cwp_player_v1';

const DEFAULT_STATE = {
  coins:           200,   // Starting coins
  hints:           15,    // Starting hints
  completedLevels: {},    // { destinationId: { stars: 1|2|3, completedAt: timestamp } }
  unlockedPacks:   ['mediterranean'], // First pack unlocked by default
  totalWordsFound: 0,
  totalBonusWords: 0,
  dailyStreak:     0,
  lastPlayedDate:  null,
  settings: {
    sound:  true,
    music:  true,
    haptics:true,
  },
};

class PlayerState {
  constructor() {
    this._data = this._load();
    this._checkDailyStreak();
  }

  // ─── Persistence (v2: swap these for Firestore) ──────────────────────────
  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_STATE };
      return { ...DEFAULT_STATE, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_STATE };
    }
  }

  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._data));
    } catch (e) {
      console.warn('[PlayerState] Could not save:', e);
    }
  }

  // ─── Coins ───────────────────────────────────────────────────────────────
  get coins()    { return this._data.coins; }

  earnCoins(n) {
    this._data.coins = Math.min(99999, this._data.coins + n);
    this._save();
    this._emit('coinsChanged', { coins: this._data.coins });
  }

  spendCoins(n) {
    if (this._data.coins < n) return false;
    this._data.coins -= n;
    this._save();
    this._emit('coinsChanged', { coins: this._data.coins });
    return true;
  }

  // ─── Hints ───────────────────────────────────────────────────────────────
  get hints()   { return this._data.hints; }

  canUseHint()       { return this._data.hints >= 1; }
  canUseHints(n)     { return this._data.hints >= n; }

  useHint() {
    if (!this.canUseHint()) return false;
    this._data.hints = Math.max(0, this._data.hints - 1);
    this._save();
    this._emit('hintsChanged', { hints: this._data.hints });
    return true;
  }

  useHints(n) {
    if (!this.canUseHints(n)) return false;
    this._data.hints = Math.max(0, this._data.hints - n);
    this._save();
    this._emit('hintsChanged', { hints: this._data.hints });
    return true;
  }

  /** Purchase hints with coins (10 coins = 1 hint) */
  buyHints(count) {
    const cost = count * 10;
    if (!this.spendCoins(cost)) return false;
    this._data.hints += count;
    this._save();
    this._emit('hintsChanged', { hints: this._data.hints });
    return true;
  }

  // ─── Level Completion ────────────────────────────────────────────────────
  completeDestination(destinationId, stars) {
    const existing = this._data.completedLevels[destinationId];
    const bestStars = existing ? Math.max(existing.stars, stars) : stars;

    this._data.completedLevels[destinationId] = {
      stars:       bestStars,
      completedAt: Date.now(),
    };
    this._data.totalWordsFound++;

    // Check if pack should unlock next
    this._checkPackUnlocks();
    this._save();
    this._emit('levelCompleted', { destinationId, stars: bestStars });
  }

  isDestinationComplete(destinationId) {
    return !!this._data.completedLevels[destinationId];
  }

  getStars(destinationId) {
    return this._data.completedLevels[destinationId]?.stars ?? 0;
  }

  // ─── Pack Unlocks ────────────────────────────────────────────────────────
  isPackUnlocked(packId) {
    return this._data.unlockedPacks.includes(packId);
  }

  unlockPack(packId) {
    if (!this._data.unlockedPacks.includes(packId)) {
      this._data.unlockedPacks.push(packId);
      this._save();
      this._emit('packUnlocked', { packId });
    }
  }

  /**
   * Auto-unlock next pack if current pack has 60%+ destinations complete
   * v2: this logic could live in a Cloud Function triggered by Firestore writes
   */
  _checkPackUnlocks() {
    const { PACKS } = window.__wordLists ?? {};
    if (!PACKS) return;

    const packOrder = PACKS.map(p => p.id);
    for (let i = 0; i < packOrder.length - 1; i++) {
      const packId = packOrder[i];
      if (!this.isPackUnlocked(packId)) continue;

      const pack = PACKS[i];
      const total = pack.destinations.length;
      const done  = pack.destinations.filter(d => this.isDestinationComplete(d.id)).length;

      if (done / total >= 0.6) {
        this.unlockPack(packOrder[i + 1]);
      }
    }
  }

  // ─── Daily Streak ────────────────────────────────────────────────────────
  _checkDailyStreak() {
    const today = new Date().toDateString();
    const last  = this._data.lastPlayedDate;

    if (last === today) return; // Already counted today

    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (last === yesterday) {
      this._data.dailyStreak++;
    } else if (last && last !== today) {
      this._data.dailyStreak = 1; // Streak broken
    } else {
      this._data.dailyStreak = 1; // First play
    }

    this._data.lastPlayedDate = today;
    this._save();
  }

  get dailyStreak() { return this._data.dailyStreak; }

  // ─── Settings ────────────────────────────────────────────────────────────
  getSetting(key)         { return this._data.settings[key] ?? true; }
  toggleSetting(key)      {
    this._data.settings[key] = !this._data.settings[key];
    this._save();
    this._emit('settingChanged', { key, value: this._data.settings[key] });
  }

  // ─── Stats ───────────────────────────────────────────────────────────────
  get totalWordsFound()  { return this._data.totalWordsFound; }
  get totalBonusWords()  { return this._data.totalBonusWords; }

  incrementBonus() {
    this._data.totalBonusWords++;
    this._save();
  }

  // ─── Event emitter (lightweight) ─────────────────────────────────────────
  _listeners = {};

  on(event, cb)  {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(cb);
  }

  off(event, cb) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(fn => fn !== cb);
  }

  _emit(event, data) {
    (this._listeners[event] ?? []).forEach(fn => fn(data));
  }

  // ─── Debug ───────────────────────────────────────────────────────────────
  /** DEV ONLY: reset all progress */
  reset() {
    localStorage.removeItem(STORAGE_KEY);
    this._data = { ...DEFAULT_STATE };
    this._save();
  }

  /** Full state snapshot (useful for v2 Firestore initial upload) */
  snapshot() {
    return JSON.parse(JSON.stringify(this._data));
  }
}

// Singleton — v2: export factory that returns Firestore-backed instance
export const playerState = new PlayerState();
