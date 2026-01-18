import React, { useRef, useEffect, Suspense, useMemo } from 'react';
import { Billboard, Text } from '@react-three/drei';
import { useFrame, useLoader } from '@react-three/fiber';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';

const MODEL_SETTINGS = {
  mainModel: '/models/rp_nathan_animated_003_walking.fbx', 
  scale: 0.02, 
  groundOffset: -2.8, 
  nameTagHeight: 1.5,
  rotationOffset: 0 
};

export function NathanModel({ pos, rot, name, isLocal, isMoving, triggerAnim, isVisible = true }) {
  const groupRef = useRef();
  const circleRef = useRef();
  const innerRef = useRef(); 
  
  const fbx = useLoader(FBXLoader, MODEL_SETTINGS.mainModel);

  const [instance, mixer, actions] = useMemo(() => {
    if (!fbx) return [null, null, {}];
    
    const cloned = SkeletonUtils.clone(fbx);
    cloned.scale.set(MODEL_SETTINGS.scale, MODEL_SETTINGS.scale, MODEL_SETTINGS.scale);
    
    cloned.traverse(c => {
      if (c.isMesh) {
        c.castShadow = c.receiveShadow = true;
        if (c.material.map) c.material.map.colorSpace = THREE.SRGBColorSpace;
      }
    });

    const newMixer = new THREE.AnimationMixer(cloned);
    const newActions = {};

    if (fbx.animations.length > 0) {
      fbx.animations.forEach(clip => {
        clip.tracks = clip.tracks.filter(track => !track.name.endsWith('.position'));
        
        const action = newMixer.clipAction(clip);
        action.setLoop(THREE.LoopRepeat);
        
        newActions[clip.name.toLowerCase()] = action;
        if (clip.name.toLowerCase().includes('walk') || clip.name === 'Take 001') {
          newActions['walk'] = action;
        }
      });
      if (!newActions['walk']) newActions['walk'] = newMixer.clipAction(fbx.animations[0]);
    }

    return [cloned, newMixer, newActions];
  }, [fbx]);

  useEffect(() => {
    if (!mixer || !actions['walk']) return;
    const walkAction = actions['walk'];
    if (isMoving) {
      walkAction.reset().fadeIn(0.2).play();
    } else {
      walkAction.fadeOut(0.2);
    }
  }, [isMoving, mixer, actions]);

  useFrame((state, delta) => {
    if (mixer) mixer.update(delta);
    
    if (groupRef.current && rot) {
      groupRef.current.rotation.y = rot[1] + MODEL_SETTINGS.rotationOffset;
    }

    if (innerRef.current) {
      innerRef.current.position.set(0, MODEL_SETTINGS.groundOffset, 0);
    }

    if (circleRef.current) {
      circleRef.current.rotation.z -= delta * 0.8;
    }
  });

  return (
    <group 
      ref={groupRef} 
      position={pos} 
      visible={isVisible}
      userData={{ isPlayer: isLocal }} // userData zur Identifizierung hinzugefügt
    >
      {!isLocal && instance && (
        <primitive 
          ref={innerRef}
          object={instance} 
          position={[0, MODEL_SETTINGS.groundOffset, 0]} 
          rotation={[0, Math.PI, 0]} 
        />
      )}
      
      <mesh 
        ref={circleRef} 
        position={[0, MODEL_SETTINGS.groundOffset + 0.1, 0]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[1.3, 1.5, 32]} />
        <meshBasicMaterial 
          color={isLocal ? "#00ff00" : "#ff0000"} 
          transparent 
          opacity={0.6} 
          side={THREE.DoubleSide}
        />
      </mesh>

      {!isLocal && (
        <Billboard position={[0, MODEL_SETTINGS.nameTagHeight + 1, 0]}>
          <Text fontSize={0.5} color="#ffffff" outlineWidth={0.04} outlineColor="#000">
            {name || "Gegner"}
          </Text>
        </Billboard>
      )}
    </group>
  );
}

export const Player = NathanModel;

export function RemotePlayer(props) {
  const meshRef = useRef();
  const targetRotY = props.rot ? props.rot[1] : 0;
  const targetPos = useMemo(() => new THREE.Vector3(...(props.pos || [0, 0, 0])), [props.pos]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.lerp(targetPos, 0.2);
      let diff = targetRotY - meshRef.current.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      meshRef.current.rotation.y += diff * 0.2;
    }
  });

  return (
    <Suspense fallback={null}>
      <group ref={meshRef}>
        <NathanModel {...props} pos={[0, 0, 0]} rot={null} isLocal={false} />
      </group>
    </Suspense>
  );
}

export function Weapon({ isMoving, isFiring }) {
  const bob = isMoving ? Math.sin(Date.now() * 0.01) * 10 : 0;
  return (
    <div style={{
      position: 'absolute', bottom: -50 + bob, left: '50%',
      transform: `translateX(-50%) scale(${isFiring ? 1.1 : 1})`,
      width: '400px', height: '500px', zIndex: 20, pointerEvents: 'none', 
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
      transition: 'transform 0.05s'
    }}>
      {isFiring && (
        <div style={{
          width: 150, height: 150, borderRadius: '50%', marginBottom: -50,
          background: 'radial-gradient(circle, #fff 0%, #ff0 30%, #f00 60%, transparent 100%)',
          filter: 'blur(10px)', opacity: 0.9, zIndex: 21
        }} />
      )}
      <div style={{
        width: '120px', height: '350px', 
        background: 'linear-gradient(to bottom, #444 0%, #111 100%)', 
        border: '5px solid #000', borderRadius: '20px 20px 0 0',
        boxShadow: 'inset 0 0 50px #000'
      }} />
    </div>
  );
}