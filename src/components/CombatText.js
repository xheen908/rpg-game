"use client";
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';

export function CombatText({ position, value, color = "yellow", isCrit = false, onComplete }) {
  const textRef = useRef();
  const [opacity, setOpacity] = useState(1);
  
  // Offset: Startet 3 Einheiten über der Basis-Position des Dummys
  const [posY, setPosY] = useState(position[1] + 3.5); 

  // Skalierung: Crits sind 1.8x so groß wie normale Treffer
  const scale = isCrit ? 1.2 : 0.6;

  useFrame((state, delta) => {
    if (opacity <= 0) {
      onComplete();
      return;
    }
    
    // Schwebe nach oben
    setPosY(prev => prev + delta * 1.2);
    // Schnelleres Ausfaden für besseren Effekt
    setOpacity(prev => Math.max(0, prev - delta * 0.7));
    
    if (textRef.current) {
      textRef.current.position.y = posY;
      textRef.current.material.opacity = opacity;
      // Text immer zur Kamera drehen
      textRef.current.quaternion.copy(state.camera.quaternion);
    }
  });

  return (
    <Text
      ref={textRef}
      position={[position[0], posY, position[2]]}
      fontSize={scale}
      color={isCrit ? "#ffcc00" : color} // Crits sind etwas goldener
      anchorX="center"
      anchorY="middle"
      outlineWidth={isCrit ? 0.08 : 0.05}
      outlineColor="#000000"
      transparent
      fontWeight={isCrit ? "bold" : "normal"}
    >
      {value}{isCrit ? "!" : ""}
    </Text>
  );
}