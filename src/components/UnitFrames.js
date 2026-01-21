"use client";
import React from 'react';

const styles = {
  container: { position: 'absolute', top: '20px', left: '20px', zIndex: 100, display: 'flex', gap: '20px', pointerEvents: 'none', fontFamily: 'monospace' },
  frame: { background: 'rgba(25, 20, 15, 0.9)', padding: '10px', borderRadius: '4px', border: '3px solid #5c4033', width: '220px', boxShadow: '0 0 10px #000' },
  title: { margin: '0 0 5px 0', fontSize: '13px', color: '#e2bc8a', textTransform: 'uppercase', fontWeight: 'bold' },
  barBg: { width: '100%', height: '20px', background: '#222', borderRadius: '2px', position: 'relative', overflow: 'hidden', border: '1px solid #444' },
  barFill: { height: '100%', transition: 'width 0.3s ease-out' },
  barText: { position: 'absolute', width: '100%', textAlign: 'center', fontSize: '10px', color: '#fff', lineHeight: '20px', fontWeight: 'bold', textShadow: '1px 1px 1px #000' }
};

export function UnitFrames({ playerName, playerHealth, playerMaxHealth, targetName, targetHealth, targetMaxHealth }) {
  const fmt = (v) => Math.ceil(v || 0).toLocaleString('de-DE');
  
  return (
    <div style={styles.container}>
      <div style={styles.frame}>
        <div style={styles.title}>{playerName || "Held"}</div>
        <div style={styles.barBg}>
          <div style={{ ...styles.barFill, width: `${(playerHealth/playerMaxHealth)*100}%`, background: 'linear-gradient(#4c4, #282)' }} />
          <div style={styles.barText}>{fmt(playerHealth)} / {fmt(playerMaxHealth)}</div>
        </div>
      </div>

      {targetName && (
        <div style={styles.frame}>
          <div style={{ ...styles.title, color: '#f44' }}>{targetName}</div>
          <div style={styles.barBg}>
            <div style={{ ...styles.barFill, width: `${(targetHealth/targetMaxHealth)*100}%`, background: 'linear-gradient(#f44, #822)' }} />
            <div style={styles.barText}>{fmt(targetHealth)} / {fmt(targetMaxHealth)}</div>
          </div>
        </div>
      )}
    </div>
  );
}