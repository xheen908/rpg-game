"use client";
import React from 'react';

const styles = {
  container: { 
    position: 'absolute', 
    top: '20px', 
    left: '20px', 
    zIndex: 1000, 
    display: 'flex', 
    gap: '25px', 
    pointerEvents: 'none', 
    fontFamily: 'monospace' // Wieder zurück auf die ursprüngliche Schriftart
  },
  frame: { 
    background: 'rgba(15, 10, 5, 0.95)', 
    padding: '12px', 
    borderRadius: '6px', 
    border: '2px solid #8b5a2b', 
    width: '260px', 
    boxShadow: '0 4px 15px rgba(0,0,0,0.8), inset 0 0 10px rgba(139,90,43,0.3)' 
  },
  title: { 
    margin: '0 0 8px 0', 
    fontSize: '14px', 
    color: '#ffcc00', 
    textTransform: 'uppercase', 
    fontWeight: 'bold',
    letterSpacing: '1px'
  },
  barBg: { 
    width: '100%', 
    height: '24px', 
    background: '#111', 
    borderRadius: '3px', 
    position: 'relative', 
    overflow: 'hidden', 
    border: '1px solid #333' 
  },
  barFill: { 
    height: '100%', 
    transition: 'width 0.2s ease-out' 
  },
  barText: { 
    position: 'absolute', 
    top: 0,
    left: 0,
    width: '100%', 
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px', 
    color: '#ffffff', 
    fontWeight: '900', 
    textShadow: '2px 2px 2px #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
    zIndex: 10
  }
};

export function UnitFrames({ playerName, playerHealth, playerMaxHealth, targetName, targetHealth, targetMaxHealth }) {
  // Formatiert Zahlen zu "100.000"
  const fmt = (v) => Math.ceil(v || 0).toLocaleString('de-DE');
  
  // Berechnung der Prozentwerte für die visuelle Leiste
  const playerPercent = Math.max(0, Math.min(100, (playerHealth / (playerMaxHealth || 1)) * 100));
  const targetPercent = Math.max(0, Math.min(100, (targetHealth / (targetMaxHealth || 1)) * 100));

  return (
    <div style={styles.container}>
      {/* Spieler Anzeige */}
      <div style={styles.frame}>
        <div style={styles.title}>{playerName || "Unbekannter Held"}</div>
        <div style={styles.barBg}>
          <div style={{ 
            ...styles.barFill, 
            width: `${playerPercent}%`, 
            background: 'linear-gradient(to bottom, #44ff44, #118811)' 
          }} />
          <div style={styles.barText}>
            {fmt(playerHealth)} / {fmt(playerMaxHealth)}
          </div>
        </div>
      </div>

      {/* Ziel Anzeige (Dummy) */}
      {targetName && targetHealth > 0 && (
        <div style={styles.frame}>
          <div style={{ ...styles.title, color: '#ff4444' }}>{targetName}</div>
          <div style={styles.barBg}>
            <div style={{ 
              ...styles.barFill, 
              width: `${targetPercent}%`, 
              background: 'linear-gradient(to bottom, #ff4444, #881111)' 
            }} />
            <div style={styles.barText}>
              {fmt(targetHealth)} / {fmt(targetMaxHealth)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}