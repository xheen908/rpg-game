"use client";
import React, { useState, useEffect, Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage, useFBX } from '@react-three/drei';
import * as THREE from 'three';
import { CastingBar } from './ui/Castbar';

const INTERFACE_SETTINGS = {
  bottomBar: { totalSlots: 24, columns: 12 },
  sideBar: { totalSlots: 24, columns: 2 },
  minimap: { size: 150 },
  slotSize: 40,
  skillbook: { width: 550, height: 480, slots: 16, innerSlotSize: 36 },
  character: { width: 380, height: 520 }
};

function CharacterModel() {
  const fbx = useFBX('/models/rp_nathan_animated_003_walking.fbx');
  const mixer = useRef();

  useEffect(() => {
    if (fbx.animations.length > 0) {
      mixer.current = new THREE.AnimationMixer(fbx);
      const action = mixer.current.clipAction(fbx.animations[0]);
      action.play();
    }
  }, [fbx]);

  useFrame((state, delta) => {
    if (mixer.current) mixer.current.update(delta);
  });

  return <primitive object={fbx} scale={0.02} position={[0, -2, 0]} />;
}

export default function Interface({ castingSpell, castProgress }) {
  const [isSkillbookOpen, setIsSkillbookOpen] = useState(false);
  const [isCharacterOpen, setIsCharacterOpen] = useState(false);

  useEffect(() => {
    const savedSkillbook = localStorage.getItem('ui_skillbook_open');
    const savedCharacter = localStorage.getItem('ui_character_open');
    if (savedSkillbook !== null) setIsSkillbookOpen(JSON.parse(savedSkillbook));
    if (savedCharacter !== null) setIsCharacterOpen(JSON.parse(savedCharacter));
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      if (key === 'p') {
        setIsSkillbookOpen(prev => {
          const next = !prev;
          localStorage.setItem('ui_skillbook_open', JSON.stringify(next));
          return next;
        });
      }
      if (key === 'c') {
        setIsCharacterOpen(prev => {
          const next = !prev;
          localStorage.setItem('ui_character_open', JSON.stringify(next));
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderActionBarSlots = (count, prefix = "slot") => 
    Array.from({ length: count }, (_, i) => (
      <div key={`${prefix}-${i}`} style={styles.slot}>
        <span style={styles.slotNumber}>{i + 1}</span>
      </div>
    ));

  return (
    <div style={styles.container}>
      {/* Minimap */}
      <div style={styles.minimapWrapper}>
        <div style={styles.minimapContent}>
          <span style={styles.placeholderText}>MINIMAP</span>
        </div>
      </div>

      {/* Castbar ist nun hier im Interface integriert */}
      <CastingBar spell={castingSpell} progress={castProgress} />

      {/* Charakter Fenster (C) */}
      {isCharacterOpen && (
        <div style={styles.characterWrapper}>
          <div style={styles.windowHeader}>
            <span style={styles.headerTitle}>CHARACTER</span>
            <button 
              onClick={() => {
                setIsCharacterOpen(false);
                localStorage.setItem('ui_character_open', JSON.stringify(false));
              }}
              style={styles.closeButton}
            >
              ×
            </button>
          </div>
          
          <div style={styles.characterContent}>
            <div style={styles.characterTopSection}>
              <div style={styles.equipmentColumn}>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={`left-eq-${i}`} style={styles.slot}><span style={styles.slotLabel}>EQ</span></div>
                ))}
              </div>

              <div style={styles.modelContainer}>
                <Canvas shadows camera={{ position: [0, 0, 5], fov: 45 }}>
                  <ambientLight intensity={0.7} />
                  <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                  <Suspense fallback={null}>
                    <Stage environment="city" intensity={0.5} contactShadow={false}>
                       <CharacterModel />
                    </Stage>
                  </Suspense>
                  <OrbitControls enableZoom={true} minDistance={2} maxDistance={10} />
                </Canvas>
              </div>

              <div style={styles.equipmentColumn}>
                {[6, 7, 8, 9, 10].map(i => (
                  <div key={`right-eq-${i}`} style={styles.slot}><span style={styles.slotLabel}>EQ</span></div>
                ))}
              </div>
            </div>

            <div style={styles.statsFooter}>
              <div style={styles.statsGrid}>
                {['STR', 'AGI', 'STA', 'INT', 'SPI'].map(stat => (
                  <div key={stat} style={styles.statBox}>
                    <span>{stat}</span>
                    <span style={styles.statVal}>10</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Skillbook (P) */}
      {isSkillbookOpen && (
        <div style={styles.skillbookWrapper}>
          <div style={styles.windowHeader}>
            <span style={styles.headerTitle}>SKILLBOOK</span>
            <button 
              onClick={() => {
                setIsSkillbookOpen(false);
                localStorage.setItem('ui_skillbook_open', JSON.stringify(false));
              }}
              style={styles.closeButton}
            >
              ×
            </button>
          </div>
          <div style={styles.skillbookBody}>
            {[0, 1].map(col => (
              <div key={`col-${col}`} style={styles.skillColumn}>
                {Array.from({ length: 8 }).map((_, i) => {
                  const num = i + 1 + (col * 8);
                  return (
                    <div key={`skill-${num}`} style={styles.skillRow}>
                      <div style={styles.skillSlot}><span style={styles.skillSlotNumber}>{num}</span></div>
                      <div style={styles.skillTextContainer}>
                        <div style={styles.skillTitle}>Skill Name {num}</div>
                        <div style={styles.skillDescription}>Ipsum Test Text</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={styles.sideBarWrapper}>
        <div style={styles.sideGrid}>{renderActionBarSlots(INTERFACE_SETTINGS.sideBar.totalSlots, "side")}</div>
      </div>

      <div style={styles.bottomBarWrapper}>
        <div style={styles.bottomGrid}>{renderActionBarSlots(INTERFACE_SETTINGS.bottomBar.totalSlots, "bottom")}</div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh',
    pointerEvents: 'none', fontFamily: 'monospace', boxSizing: 'border-box', zIndex: 100,
  },
  minimapWrapper: {
    position: 'absolute', top: '20px', right: '20px', width: `${INTERFACE_SETTINGS.minimap.size}px`,
    height: `${INTERFACE_SETTINGS.minimap.size}px`, backgroundColor: 'rgba(0, 0, 0, 0.8)',
    border: '2px solid #333', borderRadius: '4px', pointerEvents: 'auto',
  },
  minimapContent: {
    width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center',
    background: 'radial-gradient(circle, rgba(40,40,40,1) 0%, rgba(10,10,10,1) 100%)',
  },
  placeholderText: { color: '#444', fontSize: '12px', fontWeight: 'bold' },
  windowHeader: {
    padding: '8px', borderBottom: '2px solid #5c4033', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', color: '#e2bc8a', backgroundColor: 'rgba(40, 30, 20, 0.8)',
  },
  headerTitle: { fontSize: '13px', fontWeight: 'bold', letterSpacing: '2px' },
  closeButton: { background: 'none', border: 'none', color: '#e2bc8a', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' },
  characterWrapper: {
    position: 'absolute', top: '50%', left: '30%', transform: 'translate(-50%, -50%)',
    width: `${INTERFACE_SETTINGS.character.width}px`, height: `${INTERFACE_SETTINGS.character.height}px`,
    backgroundColor: 'rgba(25, 20, 15, 0.95)', border: '3px solid #5c4033', borderRadius: '8px',
    boxShadow: '0 0 30px rgba(0,0,0,0.8)', pointerEvents: 'auto', display: 'flex', flexDirection: 'column', zIndex: 190,
  },
  characterContent: { flexGrow: 1, display: 'flex', flexDirection: 'column', padding: '15px' },
  characterTopSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexGrow: 1 },
  equipmentColumn: { display: 'flex', flexDirection: 'column', gap: '8px' },
  modelContainer: {
    flexGrow: 1, height: '320px', margin: '0 10px', backgroundColor: 'rgba(0,0,0,0.6)',
    border: '1px solid #444', borderRadius: '4px', overflow: 'hidden', cursor: 'grab',
  },
  statsFooter: { marginTop: '15px', padding: '10px', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '4px', border: '1px solid #444' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '5px' },
  statBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '10px', color: '#888' },
  statVal: { color: '#ffd100', fontWeight: 'bold' },
  skillbookWrapper: {
    position: 'absolute', top: '50%', left: '70%', transform: 'translate(-50%, -50%)',
    width: `${INTERFACE_SETTINGS.skillbook.width}px`, height: `${INTERFACE_SETTINGS.skillbook.height}px`,
    backgroundColor: 'rgba(25, 20, 15, 0.95)', border: '3px solid #5c4033', borderRadius: '8px',
    boxShadow: '0 0 30px rgba(0,0,0,0.8)', pointerEvents: 'auto', display: 'flex', flexDirection: 'column', zIndex: 200,
  },
  skillbookBody: { display: 'flex', padding: '15px', gap: '20px', flexGrow: 1, overflowY: 'auto' },
  skillColumn: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },
  skillRow: { display: 'flex', alignItems: 'center', gap: '8px', padding: '4px' },
  skillSlot: {
    width: `${INTERFACE_SETTINGS.skillbook.innerSlotSize}px`, height: `${INTERFACE_SETTINGS.skillbook.innerSlotSize}px`,
    backgroundColor: 'rgba(10, 10, 10, 0.9)', border: '1px solid #444', borderRadius: '2px',
    display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', flexShrink: 0,
  },
  skillSlotNumber: { position: 'absolute', top: '1px', left: '3px', fontSize: '8px', color: '#555' },
  skillTextContainer: { display: 'flex', flexDirection: 'column' },
  skillTitle: { color: '#ffd100', fontSize: '11px', fontWeight: 'bold' },
  skillDescription: { color: '#777', fontSize: '10px' },
  bottomBarWrapper: {
    position: 'absolute', left: '50%', bottom: '20px', transform: 'translateX(-50%)',
    pointerEvents: 'auto', backgroundColor: 'rgba(0, 0, 0, 0.8)', padding: '8px', borderRadius: '4px', border: '2px solid #333',
  },
  sideBarWrapper: {
    position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)',
    pointerEvents: 'auto', backgroundColor: 'rgba(0, 0, 0, 0.8)', padding: '8px', borderRadius: '4px', border: '2px solid #333',
  },
  bottomGrid: { display: 'grid', gridTemplateColumns: `repeat(${INTERFACE_SETTINGS.bottomBar.columns}, ${INTERFACE_SETTINGS.slotSize}px)`, gap: '4px' },
  sideGrid: { display: 'grid', gridTemplateColumns: `repeat(${INTERFACE_SETTINGS.sideBar.columns}, ${INTERFACE_SETTINGS.slotSize}px)`, gap: '4px' },
  slot: {
    width: `${INTERFACE_SETTINGS.slotSize}px`, height: `${INTERFACE_SETTINGS.slotSize}px`,
    backgroundColor: 'rgba(10, 10, 10, 0.9)', border: '1px solid #444', borderRadius: '2px',
    display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', flexShrink: 0,
  },
  slotNumber: { position: 'absolute', top: '1px', left: '3px', fontSize: '9px', color: '#666', fontWeight: 'bold' },
  slotLabel: { fontSize: '8px', color: '#444' }
};