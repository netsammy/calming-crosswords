/**
 * LEVEL MANAGER
 * Manages pack/destination ordering and unlock logic.
 */

import { PACKS, getPack, getDestination } from '../data/wordLists.js';
import { playerState } from './playerState.js';

// Make PACKS available to playerState's pack-unlock check
window.__wordLists = { PACKS };

class LevelManager {
  get packs() { return PACKS; }

  /** Get all destinations in a pack */
  getDestinations(packId) {
    const pack = getPack(packId);
    return pack?.destinations ?? [];
  }

  /** Check if a destination is unlocked (its pack is unlocked) */
  isDestinationUnlocked(destinationId) {
    const dest = getDestination(destinationId);
    if (!dest) return false;
    return playerState.isPackUnlocked(dest.packId);
  }

  /**
   * Get the next unplayed destination across all unlocked packs.
   * v2: This will query Firestore for the user's progress.
   */
  getNextDestination() {
    for (const pack of PACKS) {
      if (!playerState.isPackUnlocked(pack.id)) continue;
      for (const dest of pack.destinations) {
        if (!playerState.isDestinationComplete(dest.id)) {
          return { ...dest, packId: pack.id, packName: pack.name, packEmoji: pack.emoji };
        }
      }
    }
    return null; // All destinations complete!
  }

  /**
   * Get the daily challenge destination (deterministic from date).
   * v2: This could be a server-decided puzzle to ensure everyone plays the same one.
   */
  getDailyChallenge() {
    const all  = PACKS.flatMap(p => p.destinations.map(d => ({ ...d, packId: p.id })));
    const seed = this._dateSeed();
    return all[seed % all.length];
  }

  _dateSeed() {
    const d = new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  }

  /**
   * Get enriched pack info including progress stats
   */
  getPackStats(packId) {
    const pack = getPack(packId);
    if (!pack) return null;

    const total    = pack.destinations.length;
    const complete = pack.destinations.filter(d => playerState.isDestinationComplete(d.id)).length;
    const unlocked = playerState.isPackUnlocked(packId);
    const stars    = pack.destinations.reduce((sum, d) => sum + playerState.getStars(d.id), 0);

    return { ...pack, total, complete, unlocked, stars, maxStars: total * 3 };
  }

  /** All packs with stats */
  getAllPackStats() {
    return PACKS.map(p => this.getPackStats(p.id));
  }
}

export const levelManager = new LevelManager();
