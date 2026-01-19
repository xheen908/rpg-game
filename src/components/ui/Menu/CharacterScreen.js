"use client";
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import { CharacterModel } from '../../shared/CharacterPreview';

const INTERFACE_SETTINGS = {
  character: { width: 380, height: 520 }
};

export function CharacterWindow({ onClose }) {
  return (
    <div style={styles.characterWindow}>
      <div style={styles.windowHeader}>
        CHARACTER
        <button onClick={onClose} style={styles.closeBtn}>X</button>
      </div>
      <div style={styles.characterPreview}>
        <Canvas shadows camera={{ position: [0, 0, 10], fov: 50 }}>
          <Suspense fallback={null}>
            <Stage environment="city" intensity={0.6}>
              <CharacterModel />
            </Stage>
          </Suspense>
          <OrbitControls enableZoom={true} />
        </Canvas>
      </div>
      <div style={styles.statContainer}>
        <div style={styles.statLine}>LEVEL: 01</div>
        <div style={styles.statLine}>EXP: 0 / 1000</div>
        <div style={styles.statLine}>CLASS: NEURAL_RUNNER</div>
      </div>
    </div>
  );
}

const styles = {
  characterWindow: {
    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    width: `${INTERFACE_SETTINGS.character.width}px`, height: `${INTERFACE_SETTINGS.character.height}px`,
    background: 'rgba(0,0,0,0.9)', border: '2px solid #ff0', pointerEvents: 'auto', zIndex: 1000,
  },
  windowHeader: {
    background: '#ff0', color: '#000', padding: '5px 10px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold',
  },
  closeBtn: { background: 'transparent', border: 'none', color: '#000', cursor: 'pointer', fontWeight: 'bold' },
  characterPreview: { height: '350px', background: '#000', borderBottom: '1px solid #333' },
  statContainer: { padding: '15px', color: '#ff0', fontSize: '12px', fontFamily: 'monospace' },
  statLine: { marginBottom: '5px', borderBottom: '1px solid rgba(255,255,0,0.1)' }
};