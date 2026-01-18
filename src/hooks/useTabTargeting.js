import { useState, useRef, useEffect, useMemo } from 'react';
import { dummyList } from '../components/Dummies';
import * as THREE from 'three';

const TARGET_RANGE = 40; // Maximale Targeting-Reichweite in Metern

export function useTabTargeting(playerPosition, camera, sceneObjects) {
  const [targetedDummyId, setTargetedDummyId] = useState(null);
  const currentTargetIndex = useRef(-1);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Tab') {
        e.preventDefault();

        if (!playerPosition || !camera || !sceneObjects) {
          console.warn("useTabTargeting: Spielerposition, Kamera oder Szeneobjekte fehlen.");
          return;
        }

        // 1. Filter Dummies nach Reichweite
        const potentialTargets = dummyList.filter(dummy => {
          const dummyPos = new THREE.Vector3(...dummy.pos);
          const distance = playerPosition.distanceTo(dummyPos);
          return distance <= TARGET_RANGE;
        });

        const validTargets = potentialTargets.filter(dummy => {
          const dummyPos = new THREE.Vector3(...dummy.pos);
          const directionToDummy = new THREE.Vector3().subVectors(dummyPos, camera.position).normalize();
          
          // --- Sichtbarkeitsprüfung (Kamera-FOV) ---
          const angle = camera.getWorldDirection(new THREE.Vector3()).angleTo(directionToDummy);
          const fovRadians = THREE.MathUtils.degToRad(camera.fov / 2);
          if (angle > fovRadians + 0.3) { // Etwas Toleranz für den Blickwinkel
            return false;
          }

          // --- Hindernisprüfung (Raycasting) ---
          raycaster.set(playerPosition, directionToDummy);
          raycaster.far = TARGET_RANGE;
          
          // Sammle alle Szeneobjekte, die potenzielle Hindernisse sind
          // und weder der Player noch der aktuell zu prüfende Dummy sind.
          const obstacles = sceneObjects.filter(obj => {
              // Gehe die Hierarchie eines Objekts hoch, um dessen userData zu prüfen
              let parent = obj;
              while (parent) {
                  // Wenn das Objekt der Player ist, ist es kein Hindernis
                  if (parent.userData?.isPlayer) return false;
                  // Wenn das Objekt der aktuelle Dummy ist, ist es kein Hindernis
                  if (parent.userData?.isDummy && parent.userData.dummyId === dummy.id) return false;
                  parent = parent.parent;
              }
              return true; // Es ist ein potenzielles Hindernis
          });

          const intersects = raycaster.intersectObjects(obstacles, true);

          if (intersects.length > 0) {
            const firstIntersectionPoint = intersects[0].point;
            const distanceToFirstIntersection = playerPosition.distanceTo(firstIntersectionPoint);
            const distanceToDummy = playerPosition.distanceTo(dummyPos);

            // Wenn das erste Hindernis näher ist als der Dummy (mit etwas Toleranz)
            if (distanceToFirstIntersection < distanceToDummy - 0.5) { // 0.5m Toleranz
                return false; // Hindernis gefunden
            }
          }
          return true; // Dummy ist sichtbar und nicht blockiert
        });

        // Sortiere gültige Ziele (z.B. nach der Nähe zum Spieler)
        validTargets.sort((a, b) => {
          const distA = playerPosition.distanceTo(new THREE.Vector3(...a.pos));
          const distB = playerPosition.distanceTo(new THREE.Vector3(...b.pos));
          return distA - distB; // Nächster zuerst
        });

        if (validTargets.length === 0) {
          setTargetedDummyId(null);
          currentTargetIndex.current = -1;
          return;
        }

        // Wechsle zum nächsten gültigen Ziel
        let nextIndex = currentTargetIndex.current + 1;
        if (nextIndex >= validTargets.length) {
          nextIndex = 0;
        }
        
        currentTargetIndex.current = nextIndex;
        const newTargetId = validTargets[nextIndex].id;
        setTargetedDummyId(newTargetId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [playerPosition, camera, sceneObjects, raycaster]);

  return targetedDummyId;
}