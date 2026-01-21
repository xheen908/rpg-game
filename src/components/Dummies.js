"use client";
import React, { useRef, useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';

const DUMMY_SETTINGS = {
  modelPath: '/models/Anime_character.fbx',
  texturePath: '/models/textures.png', 
  scale: 0.00005,
  groundOffset: -0.1,
  nameTagHeight: 3.8,
  maxHealth: 100000 
};

function DummyModel({ pos, rotY, name, isTargeted, id, health }) {
  const fbx = useLoader(FBXLoader, DUMMY_SETTINGS.modelPath);
  const texture = useLoader(THREE.TextureLoader, DUMMY_SETTINGS.texturePath);
  
  // Wenn der Dummy keine HP mehr hat, ist er "tot" und wird nicht gerendert
  if (health <= 0) return null;

  const instance = useMemo(() => {
    if (!fbx) return null;
    const cloned = SkeletonUtils.clone(fbx);
    cloned.scale.set(DUMMY_SETTINGS.scale, DUMMY_SETTINGS.scale, DUMMY_SETTINGS.scale);
    
    if (texture) {
      texture.flipY = true;
      texture.colorSpace = THREE.SRGBColorSpace;
    }

    cloned.traverse(c => {
      if (c.isMesh) {
        c.castShadow = true;
        c.receiveShadow = true;
        c.userData.noCollision = true;
        if (texture) {
          c.material = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.8,
            metalness: 0.2
          });
        }
      }
    });
    return cloned;
  }, [fbx, texture]);

  return (
    <group 
      position={pos} 
      rotation={[0, rotY, 0]}
      userData={{ isDummy: true, dummyId: id, noCollision: true }}
    >
      {instance && <primitive object={instance} position={[0, DUMMY_SETTINGS.groundOffset, 0]} />}
      
      {isTargeted && (
        <mesh position={[0, DUMMY_SETTINGS.groundOffset + 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.3, 1.5, 32]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}

      <Billboard position={[0, DUMMY_SETTINGS.nameTagHeight, 0]}>
        <Text fontSize={0.4} color="#ffffff" outlineWidth={0.04} outlineColor="#000">
          {name}
        </Text>
        <Text position={[0, -0.5, 0]} fontSize={0.3} color="#44ff44">
          {Math.ceil(health).toLocaleString('de-DE')} / 100.000
        </Text>
      </Billboard>
    </group>
  );
}

// Export der Initialdaten mit 100.000 HP
export const initialDummyList = [
  { id: 'd1', pos: [20, 0, 40], rotY: 0, name: "Target A", health: 100000, maxHealth: 100000 },
  { id: 'd2', pos: [40, 0, 50], rotY: Math.PI / 2, name: "Target B", health: 100000, maxHealth: 100000 },
  { id: 'd3', pos: [10, 8.5, 30], rotY: Math.PI, name: "Target C", health: 100000, maxHealth: 100000 }
];

export function Dummies({ dummies, targetedDummyId }) {
  return (
    <>
      {dummies.map(d => (
        <DummyModel 
          key={d.id} 
          id={d.id}
          pos={d.pos} 
          rotY={d.rotY} 
          name={d.name} 
          health={d.health}
          isTargeted={d.id === targetedDummyId}
        />
      ))}
    </>
  );
}