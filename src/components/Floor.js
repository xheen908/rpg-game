"use client";
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { WORLD_SIZE } from './mapData';

export function TronFloor() {
  const floorTexture = useMemo(() => {
    if (typeof window === 'undefined') return null;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    const neonColor = '#00ffff'; 
    const plateColor = '#010101'; 

    // Hintergrund: Das blaue Leuchten
    ctx.fillStyle = neonColor;
    ctx.fillRect(0, 0, 1024, 1024);

    // Große Maschen Logik
    const gridSize = 512; 
    const gap = 2.0; // Hauchdünne Linie

    ctx.fillStyle = plateColor;
    for (let x = 0; x < 1024; x += gridSize) {
      for (let y = 0; y < 1024; y += gridSize) {
        ctx.fillRect(
          x + gap / 2, 
          y + gap / 2, 
          gridSize - gap, 
          gridSize - gap
        );
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    // Hier stellen wir ein, wie groß die Platten in der Welt sind
    texture.repeat.set(25, 25); 
    texture.anisotropy = 16;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipMapLinearFilter;

    return texture;
  }, []);

  if (!floorTexture) return null;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
      <planeGeometry args={[WORLD_SIZE, WORLD_SIZE]} />
      <meshStandardMaterial 
        map={floorTexture} 
        roughness={0.05} 
        metalness={0.6}
        emissive={new THREE.Color('#00ffff')}
        emissiveIntensity={0.6}
        emissiveMap={floorTexture}
      />
    </mesh>
  );
}