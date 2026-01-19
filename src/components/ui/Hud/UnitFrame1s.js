"use client";
import React from 'react';

export function UnitFrames({ 
  playerName, 
  playerHealth, 
  playerMaxHealth = 100,
  targetName, 
  targetHealth, 
  targetMaxHealth = 100 
}) {
  const playerHealthPercentage = Math.max(0, (playerHealth / playerMaxHealth) * 100);
  const targetHealthPercentage = Math.max(0, (targetHealth / targetMaxHealth) * 100);

  return (
    <div style={containerStyle}>
      {/* Spieler Frame */}
      <div style={frameStyle}>
        <h3 style={nameStyle}>{playerName || "PILOT"}</h3>
        <div style={barContainerStyle}>
          <div style={{ ...barFillStyle, width: `${playerHealthPercentage}%`, background: 'linear-gradient(to right, #00ff00, #008800)' }}></div>
        </div>
        <span style={textStyle}>{playerHealth} / {playerMaxHealth} HP</span>
      </div>

      {/* Ziel Frame */}
      {targetName && (
        <div style={{ ...frameStyle, borderColor: '#f00' }}>
          <h3 style={nameStyle}>{targetName}</h3>
          <div style={barContainerStyle}>
            <div style={{ ...barFillStyle, width: `${targetHealthPercentage}%`, background: 'linear-gradient(to right, #ff0000, #880000)' }}></div>
          </div>
          <span style={textStyle}>{targetHealth} / {targetMaxHealth} HP</span>
        </div>
      )}
    </div>
  );
}

const containerStyle = { position: 'absolute', top: '20px', left: '20px', zIndex: 100, display: 'flex', gap: '20px', pointerEvents: 'none', fontFamily: 'monospace' };
const frameStyle = { background: 'rgba(0,0,0,0.8)', padding: '12px', borderLeft: '4px solid #ff0', width: '220px', color: '#ff0' };
const nameStyle = { margin: '0 0 8px 0', fontSize: '14px', letterSpacing: '2px', fontWeight: 'bold' };
const barContainerStyle = { width: '100%', height: '12px', background: '#222', borderRadius: '2px', overflow: 'hidden', marginBottom: '5px' };
const barFillStyle = { height: '100%', transition: 'width 0.3s ease-out' };
const textStyle = { fontSize: '11px', opacity: 0.8 };