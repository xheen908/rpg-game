"use client";
import React from 'react';

const INTERFACE_SETTINGS = {
  skillbook: { width: 550, height: 480, slots: 16, innerSlotSize: 36 }
};

export function Skillbook({ onClose }) {
  return (
    <div style={styles.skillbookWindow}>
      <div style={styles.windowHeader}>
        SPELLBOOK
        <button onClick={onClose} style={styles.closeBtn}>X</button>
      </div>
      <div style={styles.skillbookContent}>
        <div style={styles.skillGrid}>
          {Array.from({ length: INTERFACE_SETTINGS.skillbook.slots }).map((_, i) => (
            <div key={i} style={styles.skillItem}>
              <div style={styles.skillIconPlaceholder}></div>
              <div style={styles.skillTextContainer}>
                <div style={styles.skillTitle}>SKILL_NODE_{i + 1}</div>
                <div style={styles.skillDescription}>Data-stream enhancement module.</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  skillbookWindow: {
    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    width: `${INTERFACE_SETTINGS.skillbook.width}px`, height: `${INTERFACE_SETTINGS.skillbook.height}px`,
    background: 'rgba(0,0,0,0.9)', border: '2px solid #ff0', pointerEvents: 'auto', zIndex: 1000,
  },
  windowHeader: {
    background: '#ff0', color: '#000', padding: '5px 10px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold',
  },
  closeBtn: { background: 'transparent', border: 'none', color: '#000', cursor: 'pointer', fontWeight: 'bold' },
  skillbookContent: { padding: '20px', height: 'calc(100% - 30px)', overflowY: 'auto' },
  skillGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  skillItem: { display: 'flex', gap: '10px', alignItems: 'center', padding: '5px', border: '1px solid #333' },
  skillIconPlaceholder: { width: '36px', height: '36px', background: '#222', border: '1px solid #555' },
  skillTextContainer: { display: 'flex', flexDirection: 'column' },
  skillTitle: { color: '#ffd100', fontSize: '11px', fontWeight: 'bold' },
  skillDescription: { color: '#777', fontSize: '10px' },
};