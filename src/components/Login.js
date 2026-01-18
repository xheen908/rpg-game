"use client";
import React, { useState } from 'react';

const theme = {
  yellow: '#ff0',
  black: '#000',
  darkGrey: '#111',
  white: '#fff',
  border: '2px solid #ff0'
};

export function Login({ playerName, setPlayerName, onEnter }) {
  const [isHovered, setIsHovered] = useState(false);

  // Behandlung von Enter-Taste im Input-Feld
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && playerName.trim()) {
      onEnter();
    }
  };

  return (
    <div style={overlayStyle}>
      {/* Dekoratives Hintergrund-Element (Scanlines) */}
      <div style={scanlineStyle} />

      <div style={containerStyle}>
        <div style={glitchWrapper}>
          <h1 style={headerStyle}>Doom Next.js</h1>
        </div>
        
        <p style={subHeaderStyle}>IDENTIFICATION REQUIRED</p>

        <div style={inputWrapper}>
          <input 
            value={playerName} 
            onChange={(e) => setPlayerName(e.target.value)} 
            onKeyDown={handleKeyDown}
            placeholder="ENTER PILOT NAME..."
            style={inputStyle} 
            autoFocus
          />
          {/* Kleiner blinkender Cursor-Effekt unten rechts im Input */}
          <div style={inputDecoration} />
        </div>

        <button 
          onClick={onEnter}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          disabled={!playerName.trim()}
          style={{
            ...btnStyle,
            background: isHovered ? theme.white : theme.yellow,
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            opacity: playerName.trim() ? 1 : 0.5,
            cursor: playerName.trim() ? 'pointer' : 'not-allowed'
          }}
        >
          {isHovered ? '> AUTHORIZE <' : 'INITIALIZE'}
        </button>

        <div style={footerStyle}>
          <span style={{ color: theme.yellow }}>STATUS:</span> STANDBY...
        </div>
      </div>
    </div>
  );
}

// STYLES
const overlayStyle = { 
  position: 'absolute', 
  inset: 0, 
  zIndex: 200, 
  display: 'flex', 
  flexDirection: 'column', 
  justifyContent: 'center', 
  alignItems: 'center', 
  background: 'radial-gradient(circle, #1a1a1a 0%, #000 100%)', 
  color: theme.yellow, 
  fontFamily: 'monospace',
  overflow: 'hidden'
};

const scanlineStyle = {
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
  backgroundSize: '100% 4px, 3px 100%',
  pointerEvents: 'none',
  zIndex: 201
};

const containerStyle = {
  background: 'rgba(0,0,0,0.9)',
  border: theme.border,
  padding: '50px',
  textAlign: 'center',
  boxShadow: '0 0 40px rgba(255, 255, 0, 0.1)',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minWidth: '400px'
};

const headerStyle = { 
  fontSize: '2.5rem', 
  margin: '0 0 10px 0', 
  letterSpacing: '5px',
  textShadow: '3px 3px #550',
  fontWeight: '900'
};

const glitchWrapper = {
  position: 'relative',
  borderBottom: '1px solid #333',
  marginBottom: '20px',
  width: '100%'
};

const subHeaderStyle = {
  fontSize: '0.8rem',
  letterSpacing: '3px',
  marginBottom: '30px',
  opacity: 0.8
};

const inputWrapper = {
  position: 'relative',
  marginBottom: '20px',
  width: '100%'
};

const inputStyle = { 
  background: theme.darkGrey, 
  color: theme.yellow, 
  border: '1px solid #444', 
  padding: '15px 20px', 
  width: '100%',
  textAlign: 'center',
  fontSize: '1.2rem',
  outline: 'none',
  fontFamily: 'monospace',
  letterSpacing: '2px',
  transition: 'border-color 0.3s',
  boxSizing: 'border-box'
};

const inputDecoration = {
  position: 'absolute',
  bottom: '5px',
  right: '5px',
  width: '10px',
  height: '10px',
  borderRight: '2px solid #ff0',
  borderBottom: '2px solid #ff0'
};

const btnStyle = { 
  color: theme.black, 
  padding: '15px 40px', 
  border: 'none', 
  fontWeight: '900', 
  fontSize: '1.2rem',
  transition: 'all 0.2s ease',
  fontFamily: 'monospace',
  clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0% 100%)',
  marginTop: '10px',
  width: '250px'
};

const footerStyle = {
  marginTop: '30px',
  fontSize: '0.7rem',
  opacity: 0.5,
  letterSpacing: '1px'
};