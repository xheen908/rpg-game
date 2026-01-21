import React from 'react';

const styles = {
  wrapper: {
    position: 'absolute',
    bottom: '220px', 
    left: '50%',
    transform: 'translateX(-50%)',
    width: '300px',
    height: '32px',
    backgroundColor: 'rgba(25, 20, 15, 0.95)',
    border: '3px solid #5c4033', 
    borderRadius: '4px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    boxShadow: '0 0 20px rgba(0,0,0,0.8)',
    pointerEvents: 'none',
    zIndex: 1000,
  },
  progress: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    // KEINE transition hier! Das macht requestAnimationFrame
    opacity: 0.8,
  },
  text: {
    zIndex: 2,
    color: '#e2bc8a', 
    fontWeight: 'bold',
    fontSize: '11px',
    textAlign: 'center',
    textShadow: '2px 2px 2px #000',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    fontFamily: 'monospace',
  }
};

export function CastingBar({ spell, progress }) {
  // WICHTIG: Wenn kein Zauber da ist ODER der Fortschritt bei 0 ist, nicht rendern
  if (!spell) return null;

  return (
    <div style={styles.wrapper}>
      {/* Fortschrittsbalken */}
      <div style={{
        ...styles.progress,
        width: `${Math.max(0, Math.min(1, progress)) * 100}%`, // Sicherstellen, dass es zwischen 0-100 bleibt
        backgroundColor: spell.color || '#00bfff',
        boxShadow: `inset 0 0 10px rgba(255,255,255,0.2), 0 0 15px ${spell.color}66`,
      }} />
      
      {/* Name & Zeit */}
      <div style={styles.text}>
        {spell.name} - {((spell.castTime * (1 - progress)) / 1000).toFixed(1)}s
      </div>
    </div>
  );
}