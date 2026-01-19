"use client";
import React from 'react';

const INTERFACE_SETTINGS = {
  bottomBar: { totalSlots: 24, columns: 12 },
  sideBar: { totalSlots: 24, columns: 2 },
  slotSize: 40,
};

export function ActionBar() {
  // Hilfsfunktion zum Rendern eines Grids (wie im alten Interface)
  const renderGrid = (total, cols) => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, ${INTERFACE_SETTINGS.slotSize}px)`,
      gap: '4px'
    }}>
      {Array.from({ length: total }).map((_, i) => (
        <div 
          key={i} 
          style={slotStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#ff0';
            e.currentTarget.style.boxShadow = 'inset 0 0 10px rgba(255,255,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#444';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <span style={slotNumberStyle}>{i + 1}</span>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* BOTTOM BAR - Wie im alten Interface */}
      <div style={bottomBarWrapperStyle}>
        {renderGrid(INTERFACE_SETTINGS.bottomBar.totalSlots, INTERFACE_SETTINGS.bottomBar.columns)}
      </div>

      {/* SIDE BAR - Wie im alten Interface */}
      <div style={sideBarWrapperStyle}>
        {renderGrid(INTERFACE_SETTINGS.sideBar.totalSlots, INTERFACE_SETTINGS.sideBar.columns)}
      </div>
    </>
  );
}

// STYLES (Exakt aus deinem alten Interface extrahiert)
const slotStyle = {
  width: `${INTERFACE_SETTINGS.slotSize}px`,
  height: `${INTERFACE_SETTINGS.slotSize}px`,
  backgroundColor: 'rgba(20, 20, 20, 0.8)',
  border: '1px solid #444',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  cursor: 'pointer',
  transition: 'all 0.1s ease',
};

const slotNumberStyle = {
  position: 'absolute',
  top: '2px',
  left: '4px',
  fontSize: '9px',
  color: '#666',
  pointerEvents: 'none',
};

const bottomBarWrapperStyle = {
  position: 'absolute',
  left: '50%',
  bottom: '20px',
  transform: 'translateX(-50%)',
  pointerEvents: 'auto',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  padding: '8px',
  borderRadius: '4px',
  border: '2px solid #333',
  boxShadow: '0 0 20px rgba(0,0,0,0.5)',
};

const sideBarWrapperStyle = {
  position: 'absolute',
  right: '20px',
  top: '50%',
  transform: 'translateY(-50%)',
  pointerEvents: 'auto',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  padding: '8px',
  borderRadius: '4px',
  border: '2px solid #333',
  boxShadow: '0 0 20px rgba(0,0,0,0.5)',
};