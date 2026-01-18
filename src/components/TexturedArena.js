"use client";
import React, { useState, useEffect, useRef, Suspense, useMemo, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';

import { useGameSocket, socket } from '../hooks/useGameSocket';
import { Login } from './Login';
import { Lobby } from './Lobby';
import { Chat } from './Chat';
import { Player } from './Player';
import { World } from './World';
import { Level } from './Level';
import { EscMenu } from './EscMenu';
import { RemotePlayer } from './GameElements';
import { Dummies, dummyList } from './Dummies';
import { createWallTexture, createFloorTexture, createBridgeTexture } from './TextureLibrary';
import { SPAWN_POINTS } from './mapData';
import { useTabTargeting } from '../hooks/useTabTargeting';
import { UnitFrames } from './UnitFrames';

/**
 * GameContent Komponente - Hier wurde setIsPaused im Destructuring hinzugefügt
 */
function GameContent({ 
  controlsRef, 
  isChatOpen, 
  isPaused, 
  setIsPaused, // HIER HINZUGEFÜGT
  setIsMoving, 
  setIsFiring, 
  playerName, 
  mySpawnPoint, 
  textures, 
  otherPlayers,
  onPlayerHealthChange,
  playerPosition, 
  onPlayerPositionChange,
  setGlobalTargetedId 
}) {
  const { camera, scene } = useThree();

  const allSceneObjects = useMemo(() => {
    return scene.children.filter(obj => 
      obj.type === "Mesh" || (obj.type === "Group" && obj.children.length > 0)
    );
  }, [scene.children]);

  const targetedDummyId = useTabTargeting(playerPosition, camera, allSceneObjects);

  useEffect(() => {
    setGlobalTargetedId(targetedDummyId);
  }, [targetedDummyId, setGlobalTargetedId]);

  return (
    <Suspense fallback={null}>
      <ambientLight intensity={1.5} />
      <pointLight position={[30, 20, 50]} intensity={2.0} castShadow />
      <directionalLight position={[-10, 20, -10]} intensity={1.0} />

      <World floorTexture={textures.floor} />
      <Player 
        setMovingState={setIsMoving} 
        onShoot={setIsFiring} 
        isPaused={isPaused || isChatOpen} 
        playerName={playerName}
        spawnPoint={mySpawnPoint}
        onPlayerHealthChange={onPlayerHealthChange}
        onPlayerPositionChange={onPlayerPositionChange}
      />
      <Level wallTexture={textures.wall} bridgeTexture={textures.bridge} />
      
      <Dummies targetedDummyId={targetedDummyId} />

      {otherPlayers && Object.entries(otherPlayers).map(([id, p]) => (
        <RemotePlayer key={id} {...p} />
      ))}

      <PointerLockControls 
        ref={controlsRef} 
        enabled={!isChatOpen && !isPaused} 
        onUnlock={() => { if (!isChatOpen) setIsPaused(true); }} 
      />
    </Suspense>
  );
}

export default function TexturedArena() {
  const [gameState, setGameState] = useState('START');
  const [playerName, setPlayerName] = useState("");
  const [currentLobby, setCurrentLobby] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isMoving, setIsMoving] = useState(false);
  const [isFiring, setIsFiring] = useState(false);
  
  const [playerCurrentHealth, setPlayerCurrentHealth] = useState(100);
  const [playerMaxHealth, setPlayerMaxHealth] = useState(100);
  const [playerCurrentPosition, setPlayerCurrentPosition] = useState(new THREE.Vector3());
  const [targetedDummyId, setTargetedDummyId] = useState(null);

  const controlsRef = useRef();
  
  const { 
    activeLobbies = [], 
    lobbyPlayers = [], 
    chatMessages = [], 
    otherPlayers = {} 
  } = useGameSocket(setGameState);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Escape' && gameState === 'PLAYING') {
        setIsPaused(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  const mySpawnPoint = useMemo(() => {
    const index = lobbyPlayers.findIndex(p => p.id === socket.id);
    return SPAWN_POINTS[index % SPAWN_POINTS.length] || SPAWN_POINTS[0];
  }, [lobbyPlayers]);

  const textures = useMemo(() => {
    return { 
      wall: createWallTexture(), 
      floor: createFloorTexture(), 
      bridge: createBridgeTexture() 
    };
  }, []);

  const handlePlayerHealthChange = useCallback((current, max) => {
    setPlayerCurrentHealth(current);
    setPlayerMaxHealth(max);
  }, []);

  const handlePlayerPositionChange = useCallback((position) => {
    setPlayerCurrentPosition(position.clone());
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("doom_name");
    if (saved) setPlayerName(saved);
  }, []);

  const handleEnter = () => {
    if (playerName) {
      localStorage.setItem("doom_name", playerName);
      setGameState('LOBBY_SELECTION');
      socket.emit('requestLobbyList');
    }
  };

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      socket.emit('sendChatMessage', { lobbyId: currentLobby, message: chatInput, playerName });
      setChatInput("");
    }
    if (gameState === 'PLAYING') {
      setIsChatOpen(false);
      window.focus();
    }
  };

  const leaveMatch = () => {
    socket.emit('leaveLobby', currentLobby);
    setIsPaused(false);
    setGameState('LOBBY_SELECTION');
  };

  const targetedDummy = useMemo(() => {
    return dummyList.find(dummy => dummy.id === targetedDummyId);
  }, [targetedDummyId]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative', overflow: 'hidden' }}>
      
      {gameState === 'PLAYING' && (
        <UnitFrames
          playerName={playerName}
          playerHealth={playerCurrentHealth}
          playerMaxHealth={playerMaxHealth}
          targetName={targetedDummy?.name}
          targetHealth={targetedDummy?.health}
          targetMaxHealth={100}
        />
      )}

      {gameState === 'START' && <Login playerName={playerName} setPlayerName={setPlayerName} onEnter={handleEnter} />}
      
      {(gameState === 'LOBBY_SELECTION' || gameState === 'LOBBY_WAITING') && (
        <Lobby 
          gameState={gameState} activeLobbies={activeLobbies} socketId={socket.id}
          currentLobby={currentLobby} lobbyPlayers={lobbyPlayers}
          chatMessages={chatMessages} chatInput={chatInput} setChatInput={setChatInput} 
          onSendMessage={handleSendMessage}
          onJoin={(id) => { setCurrentLobby(id); socket.emit('joinLobby', { lobbyId: id, playerName }); setGameState('LOBBY_WAITING'); }}
          onCreate={() => { const id = Math.random().toString(36).substring(2, 7).toUpperCase(); setCurrentLobby(id); socket.emit('createLobby', { lobbyId: id, playerName }); setGameState('LOBBY_WAITING'); }}
          onLeave={() => { socket.emit('leaveLobby', currentLobby); setGameState('LOBBY_SELECTION'); }}
          onStart={() => socket.emit('startMatch', currentLobby)}
        />
      )}

      {gameState === 'PLAYING' && (
        <>
          {!isPaused && !isChatOpen && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 100 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="1" fill="#0f0" />
                <path d="M12 2V7M12 17V22M2 12H7M17 12H22" stroke="#0f0" strokeWidth="2" />
              </svg>
            </div>
          )}
          {isPaused && <EscMenu onResume={() => setIsPaused(false)} onLeave={leaveMatch} />}
          <Chat chatMessages={chatMessages} chatInput={chatInput} setChatInput={setChatInput} onSend={handleSendMessage} isActive={isChatOpen} />
        </>
      )}

      <Canvas shadows camera={{ fov: 75 }} onCreated={({ gl }) => {
          gl.domElement.addEventListener('mousedown', () => { if (gameState === 'PLAYING' && !isPaused && !isChatOpen) controlsRef.current?.lock(); });
      }}>
        <GameContent
          controlsRef={controlsRef} 
          isChatOpen={isChatOpen} 
          isPaused={isPaused} 
          setIsPaused={setIsPaused} // Prop wird hier korrekt weitergereicht
          setIsMoving={setIsMoving} 
          setIsFiring={setIsFiring} 
          playerName={playerName} 
          mySpawnPoint={mySpawnPoint} 
          textures={textures} 
          otherPlayers={otherPlayers}
          onPlayerHealthChange={handlePlayerHealthChange}
          playerPosition={playerCurrentPosition} 
          onPlayerPositionChange={handlePlayerPositionChange}
          setGlobalTargetedId={setTargetedDummyId}
        />
      </Canvas>
    </div>
  );
}