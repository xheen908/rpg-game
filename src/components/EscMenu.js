"use client";
import React from 'react';

export function EscMenu({ onResume, onLeave }) {
  return (
    <div style={overlayStyle}>
      <div style={containerStyle}>
        <h1 style={{ fontSize: '3rem', marginBottom: '2rem', color: '#ff0' }}>PAUSIERT</h1>
        
        <button 
          onClick={onResume}
          style={buttonStyle}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 0, 0.2)'}
          onMouseLeave={(e) => e.target.style.background = 'transparent'}
        >
          WEITER
        </button>

        <button 
          onClick={onLeave}
          style={{ ...buttonStyle, borderColor: '#f00', color: '#f00', marginTop: '20px' }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255, 0, 0, 0.2)'}
          onMouseLeave={(e) => e.target.style.background = 'transparent'}
        >
          LOBBY VERLASSEN
        </button>

        <p style={{ marginTop: '30px', fontSize: '12px', opacity: 0.7 }}>
          DRÜCKE ESC ZUM FORTSETZEN
        </p>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'absolute',
  inset: 0,
  zIndex: 200,
  background: 'rgba(0,0,0,0.85)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontFamily: 'monospace',
  color: '#ff0'
};

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '40px',
  border: '2px solid #ff0',
  background: '#000'
};

const buttonStyle = {
  background: 'transparent',
  color: '#ff0',
  border: '2px solid #ff0',
  padding: '15px 40px',
  fontSize: '1.5rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  minWidth: '280px',
  transition: 'background 0.2s ease'
};