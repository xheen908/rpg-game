"use client";
import React, { useEffect, useRef } from 'react';

export function Chat({ chatMessages, chatInput, setChatInput, onSend, isActive, onCommand }) {
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatMessages]);

  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (chatInput.startsWith('/')) {
        const command = chatInput.slice(1).toLowerCase().trim();
        if (onCommand) onCommand(command);
        setChatInput('');
      } else {
        onSend();
      }
    }
  };

  return (
    <div style={{...chatContainerStyle, opacity: isActive ? 1 : 0.6}}>
      <div style={chatHeaderStyle}>
        <span style={blinkDot}></span>
        LOCAL_COMM_LINK: ACTIVE
      </div>

      <div ref={scrollRef} style={messageBoxStyle}>
        {Array.isArray(chatMessages) && chatMessages.map((m, i) => {
          const displayAuthor = m?.playerName || m?.sender || "SYS";
          const displayText = m?.message || m?.text || "";

          return (
            <div key={i} style={messageLineStyle}>
              <span style={authorStyle}>{String(displayAuthor).toUpperCase()}:</span>
              <span style={textStyle}>{String(displayText)}</span>
            </div>
          );
        })}
      </div>

      <div style={{...inputWrapperStyle, visibility: isActive ? 'visible' : 'hidden'}}>
        <span style={{ color: '#ff0', marginRight: '5px' }}>&gt;</span>
        <input 
          ref={inputRef}
          value={chatInput} 
          onChange={e => setChatInput(e.target.value)} 
          onKeyDown={handleKeyDown} 
          placeholder="TYPE MESSAGE OR /COMMAND..."
          style={chatInputStyle} 
        />
      </div>
    </div>
  );
}

const chatContainerStyle = { 
  position: 'absolute', bottom: '40px', left: '20px', zIndex: 150, width: '350px', 
  background: 'rgba(0, 0, 0, 0.8)', borderLeft: '3px solid #ff0', padding: '10px', 
  color: '#ff0', fontFamily: 'monospace', transition: 'all 0.2s'
};
const chatHeaderStyle = { fontSize: '10px', marginBottom: '8px', borderBottom: '1px solid rgba(255, 255, 0, 0.2)' };
const blinkDot = { display: 'inline-block', width: '6px', height: '6px', background: '#ff0', borderRadius: '50%', marginRight: '8px' };
const messageBoxStyle = { height: '150px', overflowY: 'auto', marginBottom: '10px' };
const messageLineStyle = { marginBottom: '4px', fontSize: '13px', lineBreak: 'anywhere' };
const authorStyle = { color: '#aaa', marginRight: '8px', fontWeight: 'bold' };
const textStyle = { color: '#fff' };
const inputWrapperStyle = { display: 'flex', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 0, 0.3)', paddingTop: '8px' };
const chatInputStyle = { background: 'transparent', border: 'none', color: '#ff0', outline: 'none', width: '100%', fontFamily: 'monospace', fontSize: '13px' };