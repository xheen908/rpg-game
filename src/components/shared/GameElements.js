import React, { useRef, Suspense, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PlayerModel } from './PlayerModel'; // Import von der neuen Datei

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
        <PlayerModel 
            {...props} 
            pos={[0, 0, 0]} 
            rot={null} 
            isLocal={false} 
        />
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
        {isFiring && <div style={{ width: 150, height: 150, borderRadius: '50%', marginBottom: -50, background: 'radial-gradient(circle, #fff 0%, #ff0 30%, #f00 60%, transparent 100%)', filter: 'blur(10px)', opacity: 0.9, zIndex: 21 }} />}
        <div style={{ width: '120px', height: '350px', background: 'linear-gradient(to bottom, #444 0%, #111 100%)', border: '5px solid #000', borderRadius: '20px 20px 0 0', boxShadow: 'inset 0 0 50px #000' }} />
      </div>
    );
}