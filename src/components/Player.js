import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { socket } from '../hooks/useGameSocket'; 
import { MAP, GRID_SIZE } from './mapData';
import { NathanModel } from './GameElements';

const PLAYER_SETTINGS = {
  maxHealth: 100,
};

export function Player({ setMovingState, onShoot, isPaused, playerName, spawnPoint, onPlayerHealthChange, onPlayerPositionChange }) {
  const { camera, scene } = useThree();
  const moveState = useRef({ forward: false, backward: false, left: false, right: false, jump: false });
  
  const initialPos = spawnPoint?.pos || [15, 3, 50];
  const initialRot = spawnPoint?.rot || 0;
  
  const playerPos = useRef(new THREE.Vector3(...initialPos));
  const [currentRotY, setCurrentRotY] = useState(initialRot);
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const lastUpdate = useRef(0);
  const [moving, setMoving] = useState(false);
  const onGround = useRef(true);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  const [playerHealth, setPlayerHealth] = useState(PLAYER_SETTINGS.maxHealth);

  useEffect(() => {
    if (onPlayerHealthChange) {
      onPlayerHealthChange(playerHealth, PLAYER_SETTINGS.maxHealth);
    }
  }, [playerHealth, onPlayerHealthChange]);

  useEffect(() => {
    camera.rotation.order = 'YXZ'; 
    camera.rotation.y = initialRot;
  }, [camera, initialRot]);

  useFrame((state, delta) => {
    if (isPaused) return;

    if (Math.abs(currentRotY - camera.rotation.y) > 0.001) {
      setCurrentRotY(camera.rotation.y);
    }

    const speed = 0.2; // Speed leicht erhöht für besseres Gefühl
    const gravity = 0.5;
    const jumpStrength = 0.15;
    const playerRadius = 1.0;

    const isMovingNow = moveState.current.forward || moveState.current.backward || moveState.current.left || moveState.current.right;
    
    if (isMovingNow !== moving) {
      setMoving(isMovingNow);
      setMovingState(isMovingNow);
    }

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    forward.y = 0; right.y = 0;
    forward.normalize(); right.normalize();

    const moveDirection = new THREE.Vector3(0, 0, 0);
    if (moveState.current.forward) moveDirection.add(forward);
    if (moveState.current.backward) moveDirection.sub(forward);
    if (moveState.current.left) moveDirection.sub(right);
    if (moveState.current.right) moveDirection.add(right);

    if (moveDirection.length() > 0) {
      moveDirection.normalize().multiplyScalar(speed);
      
      // Nur Meshes für Kollision heranziehen
      const levelObjects = scene.children.filter(obj => obj.type === "Mesh" || obj.type === "Group");

      const canMoveTo = (dir) => {
        const nextPos = playerPos.current.clone().add(dir);
        const gridX = Math.floor(nextPos.x / GRID_SIZE + 0.5);
        const gridZ = Math.floor(nextPos.z / GRID_SIZE + 0.5);
        
        // Map-Array Check
        if (MAP[gridZ]?.[gridX] === 1) return false;

        // Raycast Check
        raycaster.ray.origin.copy(playerPos.current);
        raycaster.ray.direction.copy(dir).normalize();
        raycaster.far = playerRadius;
        const wallIntersects = raycaster.intersectObjects(levelObjects, true);
        return wallIntersects.length === 0;
      };

      if (canMoveTo(new THREE.Vector3(moveDirection.x, 0, 0))) playerPos.current.x += moveDirection.x;
      if (canMoveTo(new THREE.Vector3(0, 0, moveDirection.z))) playerPos.current.z += moveDirection.z;
    }

    // Gravity & Jump
    if (moveState.current.jump && onGround.current) {
        velocity.current.y = jumpStrength;
        onGround.current = false;
    }
    velocity.current.y -= gravity * delta;
    playerPos.current.y += velocity.current.y;

    // Boden-Kollision
    raycaster.ray.origin.copy(playerPos.current).add(new THREE.Vector3(0, 2, 0));
    raycaster.ray.direction.set(0, -1, 0);
    raycaster.far = 10;
    const groundIntersects = raycaster.intersectObjects(scene.children, true);
    
    if (groundIntersects.length > 0) {
      const groundHeight = groundIntersects[0].point.y + 3;
      if (velocity.current.y <= 0 && playerPos.current.y <= groundHeight) {
          playerPos.current.y = groundHeight;
          velocity.current.y = 0;
          onGround.current = true;
      }
    }

    camera.position.set(playerPos.current.x, playerPos.current.y, playerPos.current.z);

    // Position an Parent melden
    if (onPlayerPositionChange) {
      onPlayerPositionChange(playerPos.current);
    }

    if (Date.now() - lastUpdate.current > 33) {
      socket.emit('playerMovement', { 
        pos: [playerPos.current.x, playerPos.current.y, playerPos.current.z], 
        rot: [0, camera.rotation.y, 0], 
        isMoving: isMovingNow,
        name: playerName
      });
      lastUpdate.current = Date.now();
    }
  });

  useEffect(() => {
    const down = (e) => {
      const k = { KeyW: 'forward', KeyS: 'backward', KeyA: 'left', KeyD: 'right', Space: 'jump' };
      if (k[e.code]) moveState.current[k[e.code]] = true;
    };
    const up = (e) => {
      const k = { KeyW: 'forward', KeyS: 'backward', KeyA: 'left', KeyD: 'right', Space: 'jump' };
      if (k[e.code]) moveState.current[k[e.code]] = false;
    };
    const click = () => { if(!isPaused) { onShoot(true); setTimeout(() => onShoot(false), 100); } };
    window.addEventListener('keydown', down); 
    window.addEventListener('keyup', up);
    window.addEventListener('mousedown', click);
    return () => { 
      window.removeEventListener('keydown', down); 
      window.removeEventListener('keyup', up); 
      window.removeEventListener('mousedown', click); 
    };
  }, [onShoot, isPaused]); 

  return (
    <NathanModel 
      pos={[playerPos.current.x, playerPos.current.y, playerPos.current.z]} 
      rot={[0, currentRotY + Math.PI, 0]} 
      isLocal={true} 
      isMoving={moving} 
      name={playerName}
    />
  );
}