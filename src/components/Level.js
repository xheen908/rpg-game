import React from 'react';
import { Box } from '@react-three/drei';
import { MAP, GRID_SIZE, ARENA_STRUCTURE } from './mapData';

export function Level({ wallTexture, bridgeTexture }) {
  return (
    <>
      {/* Wände aus dem Grid */}
      {MAP.map((row, z) => row.map((cell, x) => cell === 1 && (
        <Box key={`wall-${x}-${z}`} position={[x * GRID_SIZE, 5, z * GRID_SIZE]} args={[GRID_SIZE, 10, GRID_SIZE]}>
          <meshStandardMaterial map={wallTexture} />
        </Box>
      )))}

      {/* Massive Säulen */}
      {ARENA_STRUCTURE.pillars.map((p) => (
        <Box key={p.id} position={p.pos} args={p.size}>
          <meshStandardMaterial map={wallTexture} color="#333" />
        </Box>
      ))}

      {/* BRÜCKE MIT SEITENELEMENTEN */}
      <group position={ARENA_STRUCTURE.bridge.pos}>
        {/* Haupt-Gehweg */}
        <Box args={ARENA_STRUCTURE.bridge.size}>
          <meshStandardMaterial map={bridgeTexture} />
        </Box>
        {/* Linker Balken */}
        <Box position={[0, 0, -ARENA_STRUCTURE.bridge.size[2]/2]} args={[ARENA_STRUCTURE.bridge.size[0], 1.5, 1]}>
          <meshStandardMaterial color="#111" />
        </Box>
        {/* Rechter Balken */}
        <Box position={[0, 0, ARENA_STRUCTURE.bridge.size[2]/2]} args={[ARENA_STRUCTURE.bridge.size[0], 1.5, 1]}>
          <meshStandardMaterial color="#111" />
        </Box>
      </group>

      {/* RAMPEN MIT SEITENBALKEN (SCHERGRAT STYLE) */}
      {ARENA_STRUCTURE.ramps.map((r) => (
        <group key={r.id} position={r.pos} rotation={r.rot}>
          {/* Die Rampe selbst */}
          <Box args={r.size}>
            <meshStandardMaterial map={bridgeTexture} />
          </Box>
          
          {/* Seitliche Stützbalken (machen es massiv) */}
          <Box position={[r.size[0]/2, 0.2, 0]} args={[0.5, 1.2, r.size[2]]}>
            <meshStandardMaterial color="#000" />
          </Box>
          <Box position={[-r.size[0]/2, 0.2, 0]} args={[0.5, 1.2, r.size[2]]}>
            <meshStandardMaterial color="#000" />
          </Box>
        </group>
      ))}
    </>
  );
}