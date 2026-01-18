import React from 'react';
import { Sky } from '@react-three/drei';
import { TronFloor } from './Floor';

/**
 * Die World-Komponente verwaltet die Umgebung (Himmel, Licht) 
 * und bindet den spezialisierten Tron-Boden ein.
 */
export function World() {
  return (
    <>
      {/* Atmosphäre */}
      <Sky sunPosition={[0, 1, 0]} />
      <ambientLight intensity={1.5} />
      
      {/* Der Boden mit großen Maschen und feinen Neon-Linien */}
      <TronFloor />
    </>
  );
}