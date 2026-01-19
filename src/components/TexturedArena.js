"use client";
import React, { useState, useEffect, useRef, Suspense, useMemo, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';

import { useGameSocket, socket } from '../hooks/useGameSocket';
import { Login } from './Login';
import { Lobby } from './Lobby';
import { Chat } from './Chat';
import { Player } from './engine/Player';
import { World } from './World';
import { EscMenu } from './EscMenu';
import { RemotePlayer } from './shared/GameElements';
import { Dummies, dummyList } from './Dummies';
import { createWallTexture, createFloorTexture, createBridgeTexture } from './TextureLibrary';
import { SPAWN_POINTS } from './/world/mapData';
import { useTabTargeting } from '../hooks/useTabTargeting';
import { UnitFrames } from './UnitFrames';
import Interface from './Interface';

import { Map0 } from './maps/Map0';
import { Map1 } from './maps/Map1';
import { usePlayerControls } from '../hooks/usePlayerControls';

function GameContent({
  controlsRef, isChatOpen, isPaused, setIsMoving, setIsFiring,
  playerName, mySpawnPoint, textures, otherPlayers,
  onPlayerHealthChange, playerPosition, onPlayerPositionChange,
  setGlobalTargetedId, currentMapId, isRightMouseDown 
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

      <World />
      <Player
        setMovingState={setIsMoving}
        onShoot={setIsFiring}
        isPaused={isPaused || isChatOpen}
        playerName={playerName}
        spawnPoint={mySpawnPoint}
        onPlayerHealthChange={onPlayerHealthChange}
        onPlayerPositionChange={onPlayerPositionChange}
      />

      {currentMapId === 'MAP1' ? (
        <Map1 />
      ) : (
        <Map0 wallTexture={textures.wall} bridgeTexture={textures.bridge} />
      )}

      <Dummies targetedDummyId={targetedDummyId} />

      {otherPlayers && Object.entries(otherPlayers).map(([id, p]) => (
        <RemotePlayer key={id} {...p} />
      ))}

      <PointerLockControls
        ref={controlsRef}
        // Enabled steuert die Kamera-Rotation
        enabled={isRightMouseDown && !isPaused && !isChatOpen}
        // selector={null} verhindert, dass die Komponente Listener auf das Dokument legt
        selector={null}
        onUnlock={() => {
          // Falls der Browser den Lock verliert (z.B. durch System-Popups), 
          // setzen wir den State zurück, aber pausieren nicht das Spiel.
        }} 
      />
    </Suspense>
  );
}

export default function TexturedArena() {
  const [gameState, setGameState] = useState('START');
  const [activeMap, setActiveMap] = useState('MAP0');
  const [playerName, setPlayerName] = useState("");
  const [currentLobby, setCurrentLobby] = useState(null);

  const {
    controlsRef,
    isPaused,
    setIsPaused,
    isChatOpen,
    setIsChatOpen,
    isRightMouseDown,
    setupPointerLockOnCanvas
  } = usePlayerControls(gameState);

  const [chatInput, setChatInput] = useState("");
  const [isMoving, setIsMoving] = useState(false);
  const [isFiring, setIsFiring] = useState(false);
  const [playerCurrentHealth, setPlayerCurrentHealth] = useState(100);
  const [playerMaxHealth, setPlayerMaxHealth] = useState(100);
  const [playerCurrentPosition, setPlayerCurrentPosition] = useState(new THREE.Vector3());
  const [targetedDummyId, setTargetedDummyId] = useState(null);

  const {
    activeLobbies = [],
    lobbyPlayers = [],
    chatMessages = [],
    otherPlayers = {}
  } = useGameSocket(setGameState);

  useEffect(() => {
    socket.on('mapUpdate', (mapId) => {
      setActiveMap(mapId);
    });
    return () => socket.off('mapUpdate');
  }, []);

  const mySpawnPoint = useMemo(() => {
    const index = lobbyPlayers.findIndex(p => p.id === socket.id);
    return SPAWN_POINTS[index % SPAWN_POINTS.length] || SPAWN_POINTS[0];
  }, [lobbyPlayers]);

  const textures = useMemo(() => ({
    wall: createWallTexture(), floor: createFloorTexture(), bridge: createBridgeTexture()
  }), []);

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      socket.emit('sendChatMessage', { lobbyId: currentLobby, message: chatInput, playerName });
      setChatInput("");
    }
    if (gameState === 'PLAYING') setIsChatOpen(false);
  };

  const handleMapChange = (mapId) => {
    setActiveMap(mapId);
    socket.emit('changeMap', { lobbyId: currentLobby, mapId });
  };

  const targetedDummy = useMemo(() => dummyList.find(d => d.id === targetedDummyId), [targetedDummyId]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative', overflow: 'hidden' }}>

      {gameState === 'PLAYING' && (
        <>
          <UnitFrames
            playerName={playerName} playerHealth={playerCurrentHealth} playerMaxHealth={playerMaxHealth}
            targetName={targetedDummy?.name} targetHealth={targetedDummy?.health} targetMaxHealth={100}
          />
          <Interface />
        </>
      )}

      {gameState === 'START' && <Login playerName={playerName} setPlayerName={setPlayerName} onEnter={() => {
        if (playerName) {
          localStorage.setItem("doom_name", playerName);
          setGameState('LOBBY_SELECTION');
          socket.emit('requestLobbyList');
        }
      }} />}

      {(gameState === 'LOBBY_SELECTION' || gameState === 'LOBBY_WAITING') && (
        <Lobby
          gameState={gameState} activeLobbies={activeLobbies} socketId={socket.id}
          currentLobby={currentLobby} lobbyPlayers={lobbyPlayers}
          chatMessages={chatMessages} chatInput={chatInput} setChatInput={setChatInput}
          onSendMessage={handleSendMessage}
          selectedMap={activeMap}
          onMapChange={handleMapChange}
          onJoin={(id) => { setCurrentLobby(id); socket.emit('joinLobby', { lobbyId: id, playerName }); setGameState('LOBBY_WAITING'); }}
          onCreate={() => {
            const id = Math.random().toString(36).substring(2, 7).toUpperCase();
            setCurrentLobby(id);
            socket.emit('createLobby', { lobbyId: id, playerName });
            setGameState('LOBBY_WAITING');
          }}
          onLeave={() => { socket.emit('leaveLobby', currentLobby); setGameState('LOBBY_SELECTION'); }}
          onStart={() => socket.emit('startMatch', currentLobby)}
        />
      )}

      {gameState === 'PLAYING' && (
        <>
          {isPaused && <EscMenu onResume={() => setIsPaused(false)} onLeave={() => {
            socket.emit('leaveLobby', currentLobby);
            setGameState('LOBBY_SELECTION');
          }} />}
          <Chat chatMessages={chatMessages} chatInput={chatInput} setChatInput={setChatInput} onSend={handleSendMessage} isActive={isChatOpen} />
        </>
      )}

      <Canvas shadows camera={{ fov: 75 }} onCreated={({ gl }) => {
        setupPointerLockOnCanvas(gl);
      }}>
        <GameContent
          controlsRef={controlsRef} isChatOpen={isChatOpen} isPaused={isPaused}
          setIsMoving={setIsMoving} setIsFiring={setIsFiring} playerName={playerName}
          mySpawnPoint={mySpawnPoint} textures={textures} otherPlayers={otherPlayers}
          onPlayerHealthChange={(c, m) => { setPlayerCurrentHealth(c); setPlayerMaxHealth(m); }}
          playerPosition={playerCurrentPosition}
          onPlayerPositionChange={(pos) => setPlayerCurrentPosition(pos.clone())}
          setGlobalTargetedId={setTargetedDummyId}
          currentMapId={activeMap}
          isRightMouseDown={isRightMouseDown} 
        />
      </Canvas>
    </div>
  );
}