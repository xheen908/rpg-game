import { useState, useCallback, useRef } from 'react';
import * as THREE from 'three';
import { SPELLS } from '../constants/Spells';

export function useSpellSystem(onSpellComplete) {
  const [castingSpell, setCastingSpell] = useState(null);
  const [castProgress, setCastProgress] = useState(0); 
  const castTimerRef = useRef(null);
  const startTimeRef = useRef(null);
  const currentTargetRef = useRef(null);
  const playerPosRef = useRef(null);

  const calculateDamage = (spell) => {
    const isCrit = Math.random() < spell.critChance;
    const damage = isCrit ? spell.baseDamage * spell.critMultiplier : spell.baseDamage;
    return { damage: Math.floor(damage), isCrit };
  };

  const startCast = useCallback((spellId, playerPos, target) => {
    const spell = SPELLS[spellId];
    if (!spell || castingSpell) return;

    // 1. Ziel-Prüfung
    if (!target) {
      onSpellComplete?.({ text: "Kein Ziel ausgewählt!", color: "#ff4444" });
      return;
    }

    // 2. Reichweiten-Prüfung beim Start
    const targetVec = new THREE.Vector3(...target.pos);
    const distance = playerPos.distanceTo(targetVec);

    if (distance > spell.range) {
      onSpellComplete?.({ text: "Ziel ist zu weit entfernt!", color: "#ff4444" });
      return;
    }

    // Alles okay, Cast starten
    setCastingSpell(spell);
    setCastProgress(0);
    currentTargetRef.current = target;
    playerPosRef.current = playerPos;
    startTimeRef.current = Date.now();

    const updateProgress = () => {
      if (!startTimeRef.current) return;

      // Prüfung während des Casts: Ist das Ziel noch in Reichweite?
      const currentDist = playerPosRef.current.distanceTo(new THREE.Vector3(...currentTargetRef.current.pos));
      if (currentDist > spell.range) {
        cancelCast();
        onSpellComplete?.({ text: "Zauber abgebrochen: Ziel außer Reichweite!", color: "#ff4444" });
        return;
      }

      const elapsed = Date.now() - startTimeRef.current;
      const progress = elapsed / spell.castTime;
      
      if (progress < 1) {
        setCastProgress(progress);
        castTimerRef.current = requestAnimationFrame(updateProgress);
      } else {
        setCastProgress(1);
        const result = calculateDamage(spell);
        
        onSpellComplete?.({
          text: `${spell.name} trifft ${currentTargetRef.current.name} für ${result.damage} Schaden! ${result.isCrit ? '⭐ KRITISCH! ⭐' : ''}`,
          color: spell.color,
          isCrit: result.isCrit
        });

        setTimeout(() => {
          setCastingSpell(null);
          setCastProgress(0);
          startTimeRef.current = null;
        }, 50);
      }
    };

    castTimerRef.current = requestAnimationFrame(updateProgress);
  }, [castingSpell, onSpellComplete]);

  const cancelCast = useCallback(() => {
    if (castTimerRef.current) cancelAnimationFrame(castTimerRef.current);
    startTimeRef.current = null;
    currentTargetRef.current = null;
    setCastingSpell(null);
    setCastProgress(0);
  }, []);

  return { castingSpell, castProgress, startCast, cancelCast };
}