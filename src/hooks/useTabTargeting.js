import { useState, useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';

const TARGET_RANGE = 40; 

export function useTabTargeting(playerPosition, camera, sceneObjects, dummies) {
  const [targetedDummyId, setTargetedDummyId] = useState(null);
  const currentTargetIndex = useRef(-1);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Tab') {
        e.preventDefault();

        if (!playerPosition || !camera || !sceneObjects || !dummies) return;

        // Nur Dummies filtern, die noch HP haben und in Reichweite sind
        const validTargets = dummies.filter(dummy => {
          if (dummy.health <= 0) return false;
          
          const dummyPos = new THREE.Vector3(...dummy.pos);
          const distance = playerPosition.distanceTo(dummyPos);
          if (distance > TARGET_RANGE) return false;

          const directionToDummy = new THREE.Vector3().subVectors(dummyPos, camera.position).normalize();
          const angle = camera.getWorldDirection(new THREE.Vector3()).angleTo(directionToDummy);
          const fovRadians = THREE.MathUtils.degToRad(camera.fov / 2);
          
          return angle <= fovRadians + 0.3;
        });

        if (validTargets.length === 0) {
          setTargetedDummyId(null);
          currentTargetIndex.current = -1;
          return;
        }

        let nextIndex = currentTargetIndex.current + 1;
        if (nextIndex >= validTargets.length) nextIndex = 0;
        
        currentTargetIndex.current = nextIndex;
        setTargetedDummyId(validTargets[nextIndex].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerPosition, camera, sceneObjects, raycaster, dummies]);

  return targetedDummyId;
}