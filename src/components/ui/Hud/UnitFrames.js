"use client";
import React from 'react';

export function UnitFrames({ 
  playerName, 
  playerHealth, 
  playerMaxHealth,
  targetName, 
  targetHealth, 
  targetMaxHealth 
}) {
  const playerHealthPercentage = playerMaxHealth > 0 ? (playerHealth / playerMaxHealth) * 100 : 0;
  const targetHealthPercentage = targetMaxHealth > 0 ? (targetHealth / targetMaxHealth) * 100 : 0;

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '20px',
      zIndex: 100,
      fontFamily: 'Arial, sans-serif',
      color: 'white',
      textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
      // HIER: Flexbox für nebeneinander liegende Frames
      display: 'flex',
      gap: '20px', // Abstand zwischen den beiden Frames
      alignItems: 'flex-start'
    }}>
      {/* Spieler Frame */}
      <div style={{
        background: 'rgba(0,0,0,0.6)',
        padding: '10px',
        borderRadius: '5px',
        border: '1px solid #333',
        width: '200px'
      }}>
        <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2em' }}>{playerName || "Spieler"}</h3>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
          <div style={{ 
            width: '100%', 
            height: '20px', 
            background: '#555', 
            borderRadius: '3px', 
            overflow: 'hidden' 
          }}>
            <div style={{ 
              width: `${playerHealthPercentage}%`, 
              height: '100%', 
              background: 'linear-gradient(to right, #00c400, #008f00)', 
              transition: 'width 0.2s ease-out' 
            }}></div>
          </div>
          <span style={{ marginLeft: '10px', fontSize: '0.9em' }}>{playerHealth}/{playerMaxHealth}</span>
        </div>
        <div style={{ fontSize: '0.9em', color: '#aaa' }}>Ressource: 100/100</div>
      </div>

      {/* Ziel Frame (wird nur angezeigt, wenn ein Ziel anvisiert ist) */}
      {targetName && (
        <div style={{
          background: 'rgba(0,0,0,0.6)',
          padding: '10px',
          borderRadius: '5px',
          border: '1px solid #333',
          width: '200px'
        }}>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2em' }}>{targetName}</h3>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <div style={{ 
              width: '100%', 
              height: '20px', 
              background: '#555', 
              borderRadius: '3px', 
              overflow: 'hidden' 
            }}>
              <div style={{ 
                width: `${targetHealthPercentage}%`, 
                height: '100%', 
                background: 'linear-gradient(to right, #c40000, #8f0000)', 
                transition: 'width 0.2s ease-out' 
              }}></div>
            </div>
            <span style={{ marginLeft: '10px', fontSize: '0.9em' }}>{targetHealth}/{targetMaxHealth}</span>
          </div>
          <div style={{ fontSize: '0.9em', color: '#aaa' }}>Ressource: 100/100</div>
        </div>
      )}
    </div>
  );
}