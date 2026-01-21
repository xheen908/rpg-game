import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { socket } from '../../hooks/useGameSocket'; 
import { MAP, GRID_SIZE } from '../world/mapData'; 
import { PlayerModel } from '../shared/PlayerModel';

const PLAYER_SETTINGS = {
  maxHealth: 100,
  speed: 0.2,
  gravity: 0.5,
  jumpStrength: 0.25,
  playerRadius: 1.0
};

export function Player({ 
  setMovingState, onShoot, isPaused, playerName, spawnPoint, 
  onPlayerHealthChange, onPlayerPositionChange,
  startCast, cancelCast, castingSpell 
}) {
  const { camera, scene } = useThree();
  const moveState = useRef({ 
    forward: false, backward: false, left: false, right: false, 
    jump: false, rotateLeft: false, rotateRight: false, isRightClickPressed: false 
  });
  
  const initialPos = spawnPoint?.pos || [15, 3, 50];
  const initialRot = spawnPoint?.rot || 0;
  
  const playerPos = useRef(new THREE.Vector3(...initialPos));
  const [currentRotY, setCurrentRotY] = useState(initialRot);
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const lastUpdate = useRef(0);
  const [moving, setMoving] = useState(false);
  const [groundedState, setGroundedState] = useState(true);
  const onGround = useRef(true);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const zoomDistance = useRef(5);

  const [playerHealth, setPlayerHealth] = useState(PLAYER_SETTINGS.maxHealth);

  useEffect(() => {
    if (onPlayerHealthChange) onPlayerHealthChange(playerHealth, PLAYER_SETTINGS.maxHealth);
  }, [playerHealth, onPlayerHealthChange]);

  useEffect(() => {
    camera.rotation.order = 'YXZ'; 
    camera.rotation.y = initialRot;
  }, [camera, initialRot]);

  useEffect(() => {
    const onWheel = (e) => {
      e.preventDefault();
      zoomDistance.current = Math.max(2, Math.min(zoomDistance.current + e.deltaY * 0.01, 15));
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, []);
  
  useFrame((state, delta) => {
    if (isPaused) return;

    const isRMB = moveState.current.isRightClickPressed;
    if (!isRMB) {
      if (moveState.current.rotateLeft) camera.rotation.y += 2.0 * delta;
      if (moveState.current.rotateRight) camera.rotation.y -= 2.0 * delta;
    }
    
    if (Math.abs(currentRotY - camera.rotation.y) > 0.001) setCurrentRotY(camera.rotation.y);
    
    const isMovingNow = moveState.current.forward || moveState.current.backward || 
                        moveState.current.left || moveState.current.right ||
                        (isRMB && (moveState.current.rotateLeft || moveState.current.rotateRight));
    
    // Zauber abbrechen bei Bewegung
    if (isMovingNow && castingSpell) {
      cancelCast();
    }

    if (isMovingNow !== moving) {
      setMoving(isMovingNow);
      setMovingState(isMovingNow);
    }
    
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    forward.y = 0; right.y = 0; forward.normalize(); right.normalize();
    
    const moveDir = { forward: false, backward: false, left: false, right: false };
    const velocityVec = new THREE.Vector3(0, 0, 0);

    if (moveState.current.forward) { velocityVec.add(forward); moveDir.forward = true; }
    if (moveState.current.backward) { velocityVec.sub(forward); moveDir.backward = true; }
    if (moveState.current.left || (isRMB && moveState.current.rotateLeft)) { velocityVec.sub(right); moveDir.left = true; }
    if (moveState.current.right || (isRMB && moveState.current.rotateRight)) { velocityVec.add(right); moveDir.right = true; }
    
    if (velocityVec.length() > 0) {
      velocityVec.normalize().multiplyScalar(PLAYER_SETTINGS.speed);
      
      const checkCollision = (dir) => {
        const nextPos = playerPos.current.clone().add(dir);
        if (MAP[Math.floor(nextPos.z / GRID_SIZE + 0.5)]?.[Math.floor(nextPos.x / GRID_SIZE + 0.5)] === 1) return true;
        
        raycaster.ray.origin.copy(playerPos.current).add(new THREE.Vector3(0, 1, 0));
        raycaster.ray.direction.copy(dir).normalize();
        raycaster.far = PLAYER_SETTINGS.playerRadius;
        const hits = raycaster.intersectObjects(scene.children, true);
        return hits.some(h => !h.object.userData.noCollision && !h.object.parent?.userData.noCollision);
      };

      if (!checkCollision(new THREE.Vector3(velocityVec.x, 0, 0))) playerPos.current.x += velocityVec.x;
      if (!checkCollision(new THREE.Vector3(0, 0, velocityVec.z))) playerPos.current.z += velocityVec.z;
    }
    
    if (moveState.current.jump && onGround.current) {
        velocity.current.y = PLAYER_SETTINGS.jumpStrength;
        onGround.current = false;
        setGroundedState(false);
        if (castingSpell) cancelCast();
    }
    velocity.current.y -= PLAYER_SETTINGS.gravity * delta;
    playerPos.current.y += velocity.current.y;
    
    raycaster.ray.origin.copy(playerPos.current).add(new THREE.Vector3(0, 2, 0));
    raycaster.ray.direction.set(0, -1, 0);
    raycaster.far = 10;
    const groundHits = raycaster.intersectObjects(scene.children, true).filter(h => !h.object.userData.noCollision && !h.object.parent?.userData.noCollision);
    
    if (groundHits.length > 0) {
      const gHeight = groundHits[0].point.y + 3;
      if (velocity.current.y <= 0 && playerPos.current.y <= gHeight) {
          playerPos.current.y = gHeight;
          velocity.current.y = 0;
          if (!onGround.current) {
              onGround.current = true;
              setGroundedState(true);
          }
      }
    }

    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
    const desiredPos = playerPos.current.clone().add(camDir.normalize().multiplyScalar(-zoomDistance.current));
    desiredPos.y += 2;
    camera.position.copy(desiredPos);
    
    if (onPlayerPositionChange) onPlayerPositionChange(playerPos.current);
    
    if (Date.now() - lastUpdate.current > 33) {
      socket.emit('playerMovement', { 
        pos: [playerPos.current.x, playerPos.current.y, playerPos.current.z], 
        rot: [0, camera.rotation.y, 0], 
        isMoving: isMovingNow,
        moveDirection: moveDir,
        isGrounded: onGround.current,
        name: playerName
      });
      lastUpdate.current = Date.now();
    }
  });
  
  useEffect(() => {
    const down = (e) => {
      const k = { KeyW: 'forward', KeyS: 'backward', KeyQ: 'left', KeyE: 'right', KeyA: 'rotateLeft', KeyD: 'rotateRight', Space: 'jump' };
      if (k[e.code]) moveState.current[k[e.code]] = true;
      
      // Taste '1' für Frostblitz
      if (e.code === 'Digit1' && !isPaused && startCast) {
        startCast('FROSTBOLT');
      }
    };
    const up = (e) => {
      const k = { KeyW: 'forward', KeyS: 'backward', KeyQ: 'left', KeyE: 'right', KeyA: 'rotateLeft', KeyD: 'rotateRight', Space: 'jump' };
      if (k[e.code]) moveState.current[k[e.code]] = false;
    };
    const mDown = (e) => {
      if (e.button === 0 && !isPaused) { onShoot(true); setTimeout(() => onShoot(false), 100); }
      if (e.button === 2) moveState.current.isRightClickPressed = true;
    };
    const mUp = (e) => { if (e.button === 2) moveState.current.isRightClickPressed = false; };
    const contextMenu = (e) => e.preventDefault();

    window.addEventListener('keydown', down); 
    window.addEventListener('keyup', up);
    window.addEventListener('mousedown', mDown);
    window.addEventListener('mouseup', mUp);
    window.addEventListener('contextmenu', contextMenu);
    return () => { 
      window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); 
      window.removeEventListener('mousedown', mDown); window.removeEventListener('mouseup', mUp);
      window.removeEventListener('contextmenu', contextMenu);
    };
  }, [onShoot, isPaused, startCast]); 
  
  return (
    <PlayerModel 
      pos={[playerPos.current.x, playerPos.current.y, playerPos.current.z]} 
      rot={[0, currentRotY + Math.PI, 0]} 
      isLocal={true} 
      isMoving={moving} 
      isGrounded={groundedState}
      moveDirection={moving ? {
          forward: moveState.current.forward,
          backward: moveState.current.backward,
          left: moveState.current.left || (moveState.current.isRightClickPressed && moveState.current.rotateLeft),
          right: moveState.current.right || (moveState.current.isRightClickPressed && moveState.current.rotateRight)
      } : null}
      name={playerName}
    />
  );
}