"use client";
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Trail, Sphere } from '@react-three/drei';
import * as THREE from 'three';

export function Frostbolt({ id, startPos, targetPos, onHit }) {
  const meshRef = useRef();
  const speed = 0.15; // Geschwindigkeit des Projektils

  useFrame(() => {
    if (meshRef.current) {
      // Bewege Projektil zum Ziel
      meshRef.current.position.lerp(targetPos, speed);
      
      // Rotation für Eiseffekt
      meshRef.current.rotation.x += 0.2;
      meshRef.current.rotation.z += 0.2;

      // Wenn nah genug am Ziel: Einschlag auslösen
      if (meshRef.current.position.distanceTo(targetPos) < 0.8) {
        onHit(id);
      }
    }
  });

  return (
    <Trail
      width={1.2}
      length={10}
      color={new THREE.Color('#00bfff')}
      attenuation={(t) => t * t}
    >
      <group ref={meshRef} position={startPos}>
        <Sphere args={[0.3, 16, 16]}>
          <meshBasicMaterial color="#ffffff" />
        </Sphere>
        <mesh>
          <icosahedronGeometry args={[0.5, 1]} />
          <meshStandardMaterial 
            color="#00bfff" 
            emissive="#00ffff" 
            emissiveIntensity={2} 
            transparent 
            opacity={0.6} 
            wireframe 
          />
        </mesh>
        <pointLight color="#00ffff" intensity={2} distance={5} />
      </group>
    </Trail>
  );
}