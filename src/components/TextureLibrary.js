import * as THREE from 'three';

const isBrowser = typeof window !== 'undefined';

/**
 * Normale Wand-Textur (einfacher Tron-Rahmen)
 */
export function createWallTexture() {
  if (!isBrowser) return null;
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = '#00f2ff';
  ctx.lineWidth = 4;
  ctx.strokeRect(5, 5, 502, 502);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * EXKLUSIV FÜR BRÜCKEN-SÄULEN: Cyber-Datenpfade (nach deinem Bild)
 */
export function createPillarTexture() {
  if (!isBrowser) return null;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Hintergrund
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 1024, 1024);

  const neonColor = '#00f2ff';
  const step = 64;

  // 1. Hintergrund-Grid (sehr dezent)
  ctx.strokeStyle = 'rgba(0, 242, 255, 0.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 1024; i += step) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 1024); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(1024, i); ctx.stroke();
  }

  // 2. Datenpfade zeichnen
  ctx.shadowBlur = 15;
  ctx.shadowColor = neonColor;
  ctx.strokeStyle = neonColor;
  ctx.lineWidth = 3;

  for (let i = 0; i < 20; i++) {
    let x = Math.floor(Math.random() * (1024 / step)) * step;
    let y = Math.floor(Math.random() * (1024 / step)) * step;
    let len = (Math.floor(Math.random() * 3) + 1) * step;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    if (Math.random() > 0.5) {
      ctx.lineTo(x + len, y); // Horizontaler Pfad
    } else {
      ctx.lineTo(x, y + len); // Vertikaler Pfad
    }
    ctx.stroke();

    // Leuchtende Knotenpunkte (Dots)
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#fff'; 
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  // Anisotropy sorgt dafür, dass die Linien auf den Säulen von weitem scharf bleiben
  texture.anisotropy = 16;
  return texture;
}

/**
 * Boden-Textur: Große schwarze Platten, feine Linien
 */
export function createFloorTexture() {
  if (!isBrowser) return null;
  const canvas = document.createElement('canvas');
  canvas.width = 1024; canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  const neonColor = '#00ffff'; 
  const plateColor = '#010101'; 
  ctx.fillStyle = neonColor;
  ctx.fillRect(0, 0, 1024, 1024);
  const gridSize = 512; 
  const gap = 2.0;
  ctx.fillStyle = plateColor;
  for (let x = 0; x < 1024; x += gridSize) {
    for (let y = 0; y < 1024; y += gridSize) {
      ctx.fillRect(x + gap / 2, y + gap / 2, gridSize - gap, gridSize - gap);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipMapLinearFilter;
  texture.anisotropy = 16; 
  return texture;
}

/**
 * Brücken-Fahrbahn-Textur
 */
export function createBridgeTexture() {
  if (!isBrowser) return null;
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = '#ff8800';
  ctx.lineWidth = 4;
  for (let i = -256; i < 512; i += 64) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + 256, 256); ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}