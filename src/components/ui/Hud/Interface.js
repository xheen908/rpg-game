"use client";
import React, { useState, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import { CharacterModel } from '../../shared/CharacterPreview';
import { UnitFrames } from './UnitFrames';
import { Minimap } from './Minimap';
import { ActionBar } from './ActionBar';
import { Skillbook } from '../menu/Skillbook';

/**
 * Interface Komponente (HUD)
 * Best Practice: Kapselung aller UI-Elemente und State-Management für Fenster.
 */
export function Interface({ 
  playerName, 
  playerHealth, 
  playerPos, 
  remotePlayers, 
  targetData 
}) {
  const [showCharacter, setShowCharacter] = useState(false);
  const [showSkillbook, setShowSkillbook] = useState(false);

  // Tastatur-Steuerung für Fenster (C für Character, P für Skills)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return; // Ignorieren, wenn im Chat getippt wird
      
      if (e.code === 'KeyC') setShowCharacter(prev => !prev);
      if (e.code === 'KeyP') setShowSkillbook(prev => !prev);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div style={uiContainerStyle}>
      {/* UNIT FRAMES: Spieler & Target Anzeige */}
      <UnitFrames 
        playerName={playerName || "UNKNOWN_ENTITY"} 
        playerHealth={playerHealth} 
        playerMaxHealth={100}
        targetName={targetData?.name} 
        targetHealth={targetData?.health}
        targetMaxHealth={100}
      />

      {/* MINIMAP: Radar-Anzeige */}
      <Minimap playerPos={playerPos} remotePlayers={remotePlayers} size={150} />

      {/* ACTION BARS: Bottom & Side Bars (interne Positionierung) */}
      <ActionBar />

      {/* CHARACTER WINDOW: 3D Vorschau */}
      {showCharacter && (
        <div style={windowStyle}>
          <div style={windowHeader}>
            <span>CHARACTER_STATUS</span>
            <button onClick={() => setShowCharacter(false)} style={closeBtnStyle}>[ X ]</button>
          </div>
          <div style={windowContentStyle}>
            <Canvas shadows camera={{ position: [0, 0, 10], fov: 50 }}>
              <Suspense fallback={null}>
                <Stage environment="city" intensity={0.6} contactShadow={false}>
                  <CharacterModel />
                </Stage>
              </Suspense>
              <OrbitControls enableZoom={true} enablePan={false} />
            </Canvas>
          </div>
          <div style={windowFooterStyle}>NEURAL_LINK: STABLE // BIOMETRIC_SYNC: 100%</div>
        </div>
      )}

      {/* SKILLBOOK WINDOW */}
      {showSkillbook && (
        <Skillbook onClose={() => setShowSkillbook(false)} />
      )}

      {/* NAVIGATION BUTTONS (Rechts über der Sidebar) */}
      <div style={navStyle}>
        <button 
          style={btnStyle} 
          onClick={() => setShowCharacter(!showCharacter)}
          onMouseEnter={(e) => { e.target.style.background = '#ff0'; e.target.style.color = '#000'; }}
          onMouseLeave={(e) => { e.target.style.background = '#000'; e.target.style.color = '#ff0'; }}
        >
          C - CHARACTER
        </button>
        <button 
          style={btnStyle} 
          onClick={() => setShowSkillbook(!showSkillbook)}
          onMouseEnter={(e) => { e.target.style.background = '#ff0'; e.target.style.color = '#000'; }}
          onMouseLeave={(e) => { e.target.style.background = '#000'; e.target.style.color = '#ff0'; }}
        >
          P - SKILLS
        </button>
      </div>
    </div>
  );
}

// --- STYLES ---

const uiContainerStyle = { 
  position: 'absolute', 
  inset: 0, 
  pointerEvents: 'none', 
  fontFamily: 'monospace', 
  zIndex: 100 
};

const navStyle = { 
  position: 'absolute', 
  bottom: '120px', 
  right: '25px', 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '10px', 
  pointerEvents: 'auto' 
};

const btnStyle = { 
  background: '#000', 
  color: '#ff0', 
  border: '1px solid #ff0', 
  padding: '8px 15px', 
  cursor: 'pointer',
  fontSize: '11px',
  fontWeight: 'bold',
  transition: 'all 0.2s ease',
  boxShadow: '0 0 10px rgba(0,0,0,0.5)'
};

const windowStyle = { 
  position: 'absolute', 
  top: '45%', 
  left: '50%', 
  transform: 'translate(-50%, -50%)', 
  width: '400px', 
  background: 'rgba(0,0,0,0.95)', 
  border: '2px solid #ff0', 
  pointerEvents: 'auto', 
  zIndex: 1000,
  boxShadow: '0 0 50px rgba(0,0,0,1)'
};

const windowHeader = { 
  background: '#ff0', 
  color: '#000', 
  padding: '8px 12px', 
  display: 'flex', 
  justifyContent: 'space-between', 
  fontWeight: 'bold',
  fontSize: '13px'
};

const windowContentStyle = { 
  height: '450px', 
  background: 'radial-gradient(circle, #111 0%, #000 100%)' 
};

const windowFooterStyle = {
  padding: '8px',
  fontSize: '9px',
  color: '#666',
  textAlign: 'center',
  borderTop: '1px solid #222'
};

const closeBtnStyle = { 
  background: 'transparent', 
  border: 'none', 
  color: '#000', 
  cursor: 'pointer', 
  fontWeight: 'bold' 
};