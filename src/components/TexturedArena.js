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
import { Dummies, initialDummyList } from './Dummies';
import { createWallTexture, createFloorTexture, createBridgeTexture } from './TextureLibrary';
import { SPAWN_POINTS } from './/world/mapData';
import { useTabTargeting } from '../hooks/useTabTargeting';
import { UnitFrames } from './UnitFrames';
import Interface from './Interface';
import { Map0 } from './maps/Map0';
import { Map1 } from './maps/Map1';
import { usePlayerControls } from '../hooks/usePlayerControls';
import { useSpellSystem } from '../hooks/useSpellSystem';
import { Frostbolt } from './Frostblitz'; 

function GameContent({
  controlsRef, isChatOpen, isPaused, setIsMoving, setIsFiring,
  playerName, mySpawnPoint, textures, otherPlayers,
  onPlayerHealthChange, playerPosition, onPlayerPositionChange,
  setGlobalTargetedId, currentMapId, isRightMouseDown,
  startCast, cancelCast, castingSpell, dummies, 
  projectiles, onProjectileHit 
}) {
  const { camera, scene } = useThree();

  const allSceneObjects = useMemo(() => {
    return scene.children.filter(obj =>
      obj.type === "Mesh" || (obj.type === "Group" && obj.children.length > 0)
    );
  }, [scene.children]);

  const targetedDummyId = useTabTargeting(playerPosition, camera, allSceneObjects, dummies);

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
        startCast={startCast}
        cancelCast={cancelCast}
        castingSpell={castingSpell}
      />

      {currentMapId === 'MAP1' ? <Map1 /> : <Map0 wallTexture={textures.wall} bridgeTexture={textures.bridge} />}
      <Dummies dummies={dummies} targetedDummyId={targetedDummyId} />

      {projectiles.map(p => (
        <Frostbolt 
          key={p.id} 
          id={p.id} 
          startPos={p.startPos} 
          targetPos={p.targetPos} 
          onHit={onProjectileHit} 
        />
      ))}

      {otherPlayers && Object.entries(otherPlayers).map(([id, p]) => (
        <RemotePlayer key={id} {...p} />
      ))}

      <PointerLockControls
        ref={controlsRef}
        enabled={isRightMouseDown && !isPaused && !isChatOpen}
        selector={null}
      />
    </Suspense>
  );
}

export default function TexturedArena() {
  const [gameState, setGameState] = useState('START');
  const [activeMap, setActiveMap] = useState('MAP0');
  const [playerName, setPlayerName] = useState("");
  const [currentLobby, setCurrentLobby] = useState(null);
  const [localMessages, setLocalMessages] = useState([]);
  const [dummies, setDummies] = useState(initialDummyList);
  const [projectiles, setProjectiles] = useState([]);

  const handleProjectileHit = useCallback((projectileId) => {
    setProjectiles(prev => {
      const proj = prev.find(p => p.id === projectileId);
      if (proj) {
        setDummies(dums => dums.map(d => 
          d.id === proj.targetId 
            ? { ...d, health: Math.max(0, d.health - proj.damage) } 
            : d
        ));
        const msg = {
          text: `TREFFER! ${proj.damage} Schaden!`,
          color: proj.color,
          time: Date.now()
        };
        setLocalMessages(m => [...m, msg].slice(-50));
      }
      return prev.filter(p => p.id !== projectileId);
    });
  }, []);

  const handleSpellComplete = useCallback((result) => {
    if (result.type === 'PROJECTILE_LAUNCH') {
      const newProj = {
        id: Math.random().toString(),
        startPos: result.startPos,
        targetPos: result.targetPos,
        targetId: result.targetId,
        damage: result.damage,
        color: result.color
      };
      setProjectiles(prev => [...prev, newProj]);
    }
    
    if (result.text) {
        setLocalMessages(prev => [...prev, {
            text: result.text,
            color: result.color,
            time: Date.now()
        }].slice(-50));
    }
  }, []);

  const { castingSpell, castProgress, startCast, cancelCast } = useSpellSystem(handleSpellComplete);
  const { controlsRef, isPaused, setIsPaused, isChatOpen, setIsChatOpen, isRightMouseDown, setupPointerLockOnCanvas } = usePlayerControls(gameState);

  const [chatInput, setChatInput] = useState("");
  const [isMoving, setIsMoving] = useState(false);
  const [isFiring, setIsFiring] = useState(false);
  const [playerCurrentHealth, setPlayerCurrentHealth] = useState(100);
  const [playerMaxHealth, setPlayerMaxHealth] = useState(100);
  const [playerCurrentPosition, setPlayerCurrentPosition] = useState(new THREE.Vector3());
  const [targetedDummyId, setTargetedDummyId] = useState(null);

  const { activeLobbies = [], lobbyPlayers = [], chatMessages = [], otherPlayers = {} } = useGameSocket(setGameState);
  const allMessages = useMemo(() => [...chatMessages, ...localMessages], [chatMessages, localMessages]);

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
    if (currentLobby) {
      socket.emit('changeMap', { lobbyId: currentLobby, mapId });
    }
  };

  const targetedDummy = useMemo(() => dummies.find(d => d.id === targetedDummyId), [targetedDummyId, dummies]);

  const handleStartCast = useCallback((spellId) => {
    if (startCast) startCast(spellId, playerCurrentPosition, targetedDummy);
  }, [startCast, playerCurrentPosition, targetedDummy]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative', overflow: 'hidden' }}>
      {gameState === 'PLAYING' && (
        <>
          <UnitFrames
            playerName={playerName} playerHealth={playerCurrentHealth} playerMaxHealth={playerMaxHealth}
            targetName={targetedDummy?.name} targetHealth={targetedDummy?.health || 0} targetMaxHealth={100000}
          />
          <Interface castingSpell={castingSpell} castProgress={castProgress} />
        </>
      )}

      {gameState === 'START' && <Login playerName={playerName} setPlayerName={setPlayerName} onEnter={() => {
        if (playerName) {
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

      {gameState === 'PLAYING' && isPaused && <EscMenu onResume={() => setIsPaused(false)} onLeave={() => {
        socket.emit('leaveLobby', currentLobby);
        setGameState('LOBBY_SELECTION');
      }} />}

      {gameState === 'PLAYING' && <Chat chatMessages={allMessages} chatInput={chatInput} setChatInput={setChatInput} onSend={handleSendMessage} isActive={isChatOpen} />}

      <Canvas shadows camera={{ fov: 75 }} onCreated={({ gl }) => setupPointerLockOnCanvas(gl)}>
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
          startCast={handleStartCast}
          cancelCast={cancelCast}
          castingSpell={castingSpell}
          dummies={dummies}
          projectiles={projectiles}
          onProjectileHit={handleProjectileHit}
        />
      </Canvas>
    </div>
  );
}