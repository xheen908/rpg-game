"use client";
import React from 'react';
import { Chat } from './Chat';

const theme = {
  yellow: '#ff0',
  red: '#f00',
  white: '#fff',
  bgDark: 'rgba(0,0,0,0.95)',
  bgItem: '#111',
  border: '2px solid #ff0'
};

const btnBase = {
  padding: '12px 25px',
  border: 'none',
  fontWeight: '900',
  cursor: 'pointer',
  fontFamily: 'monospace',
  textTransform: 'uppercase',
  transition: 'all 0.2s ease',
  clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0% 100%)',
};

export function Lobby({ 
  gameState, activeLobbies, onJoin, onCreate, 
  currentLobby, lobbyPlayers, onLeave, onStart, socketId,
  chatMessages, chatInput, setChatInput, onSendMessage 
}) {
  
  const hostPlayer = lobbyPlayers.find(p => p.isHost);

  const ActionButton = ({ onClick, style, children }) => (
    <button 
      onClick={onClick}
      onMouseEnter={(e) => e.target.style.filter = 'brightness(1.2) saturate(1.2)'}
      onMouseLeave={(e) => e.target.style.filter = 'none'}
      style={{ ...btnBase, ...style }}
    >
      {children}
    </button>
  );

  if (gameState === 'LOBBY_SELECTION') {
    return (
      <div style={overlayStyle}>
        <div style={containerStyle}>
          <h1 style={headerStyle}>AVAILABLE ARENAS</h1>
          <div style={listStyle}>
            {activeLobbies.length === 0 ? (
              <div style={emptyStateStyle}>SCANNING FOR SIGNALS...</div>
            ) : (
              activeLobbies.map(l => (
                <div key={l.id} style={lobbyItemStyle}>
                  <div>
                    <span style={{ color: theme.white, fontWeight: 'bold' }}>{l.hostName?.toUpperCase() || l.id}</span>
                    <div style={{ color: theme.yellow, fontSize: '0.7rem' }}>{l.playerCount} PLAYERS</div>
                  </div>
                  <ActionButton onClick={() => onJoin(l.id)} style={{ background: theme.yellow, color: '#000' }}>JOIN</ActionButton>
                </div>
              ))
            )}
          </div>
          <ActionButton onClick={onCreate} style={{ background: theme.white, color: '#000', width: '100%', marginTop: '20px' }}>CREATE ARENA</ActionButton>
        </div>
      </div>
    );
  }

  return (
    <div style={overlayStyle}>
      <div style={{ display: 'flex', gap: '20px', height: '600px', alignItems: 'stretch' }}>
        
        {/* LINKER BEREICH: ARENA INFO */}
        <div style={{ ...containerStyle, width: '450px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ borderBottom: theme.border, marginBottom: '20px', paddingBottom: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '1.8rem', letterSpacing: '2px' }}>ARENA: {currentLobby}</h2>
            <div style={{ color: theme.white, fontSize: '0.9rem', marginTop: '5px', opacity: 0.8 }}>
              ENCRYPTED CHANNEL / HOST: <span style={{ color: theme.yellow }}>{hostPlayer ? hostPlayer.name.toUpperCase() : "..."}</span>
            </div>
          </div>
          
          <div style={playerListContainer}>
            <div style={{ fontSize: '0.8rem', color: theme.yellow, marginBottom: '15px', fontWeight: 'bold', borderBottom: '1px solid #333' }}>
              CONNECTED COMBATANTS:
            </div>
            {lobbyPlayers.map((p, i) => (
              <div key={i} style={{ 
                color: p.isHost ? theme.yellow : theme.white, 
                padding: '8px 12px',
                marginBottom: '5px',
                background: p.id === socketId ? 'rgba(255,255,0,0.1)' : 'transparent',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderLeft: p.isHost ? `3px solid ${theme.yellow}` : '3px solid transparent'
              }}>
                <span style={{ fontWeight: p.id === socketId ? '900' : 'normal' }}>
                  {p.name.toUpperCase()} {p.id === socketId && <small style={{ opacity: 0.5, marginLeft: '10px' }}>(YOU)</small>}
                </span>
                {p.isHost && <span style={{ fontSize: '0.6rem', padding: '2px 5px', border: `1px solid ${theme.yellow}` }}>HOST</span>}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto' }}>
            {hostPlayer?.id === socketId && (
              <ActionButton 
                onClick={onStart} 
                style={{ background: theme.yellow, color: '#000', fontSize: '1.3rem', padding: '18px' }}
              >
                INITIATE BATTLE
              </ActionButton>
            )}
            <ActionButton 
              onClick={onLeave} 
              style={{ background: 'transparent', color: theme.red, border: `1px solid ${theme.red}`, clipPath: 'none' }}
            >
              ABORT MISSION
            </ActionButton>
          </div>
        </div>

        {/* RECHTER BEREICH: GESTRETCHTER CHAT */}
        <div style={{ 
          width: '450px', 
          background: 'rgba(0,0,0,0.8)', 
          border: '1px solid #333',
          position: 'relative',
          display: 'flex'
        }}>
          {/* Wrapper um Chat, damit er den gesamten Kasten ausfüllt */}
          <div style={{ flex: 1, position: 'relative' }}>
            <Chat 
              chatMessages={chatMessages}
              chatInput={chatInput}
              setChatInput={setChatInput}
              onSend={onSendMessage}
              isActive={true} 
            />
          </div>
        </div>

      </div>
    </div>
  );
}

const overlayStyle = { 
  position: 'absolute', inset: 0, zIndex: 100, display: 'flex', 
  justifyContent: 'center', alignItems: 'center', 
  background: 'radial-gradient(circle, #1a1a1a 0%, #000 100%)', 
  color: theme.yellow, fontFamily: 'monospace' 
};

const containerStyle = {
  background: theme.bgDark, border: theme.border, padding: '40px',
  boxShadow: '0 0 30px rgba(255, 255, 0, 0.15)', position: 'relative'
};

const headerStyle = { 
  margin: '0 0 25px 0', textAlign: 'center', letterSpacing: '6px',
  fontSize: '2.5rem', textShadow: '2px 2px #550'
};

const listStyle = { 
  width: '450px', height: '350px', border: '1px solid #333', 
  overflowY: 'auto', padding: '10px', background: 'rgba(255,255,255,0.02)'
};

const lobbyItemStyle = { 
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '15px', marginBottom: '10px', background: theme.bgItem
};

const emptyStateStyle = { 
  height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: 0.4
};

const playerListContainer = { 
  margin: '20px 0', background: '#0a0a0a', padding: '15px', 
  border: '1px solid #222', flex: 1, overflowY: 'auto',
  boxShadow: 'inset 0 0 10px #000'
};