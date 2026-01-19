"use client";

export const SPELLS = {
  FROSTBOLT: {
    name: "Frostblitz",
    castTime: 2000,
    damage: 25
  }
};

export class SpellManager {
  constructor(updateCallback, finishCallback) {
    this.timer = null;
    this.onUpdate = updateCallback;
    this.onFinish = finishCallback;
  }

  startCast(spellKey, targetId) {
    if (this.timer) return;
    const spell = SPELLS[spellKey];
    const startTime = Date.now();

    this.timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / spell.castTime, 1);

      this.onUpdate({ isCasting: true, progress, spellName: spell.name });

      if (progress >= 1) {
        clearInterval(this.timer);
        this.timer = null;
        this.onFinish(targetId, spell.damage);
        this.onUpdate({ isCasting: false, progress: 0, spellName: "" });
      }
    }, 50);
  }

  cancelCast() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      this.onUpdate({ isCasting: false, progress: 0, spellName: "" });
    }
  }
}