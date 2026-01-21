import React, { useRef, useMemo, useEffect } from 'react';
import { Billboard, Text } from '@react-three/drei';
import { useFrame, useLoader } from '@react-three/fiber';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { TextureLoader } from 'three/src/loaders/TextureLoader';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';

const MODEL_SETTINGS = {
  mainModel: '/models/Mannequin_Medium.fbx',
  basicAnims: '/models/Rig_Medium_General.fbx',
  texturePath: '/models/mannequin_texture.png',
  scale: 2,
  groundOffset: -1.5,
  nameTagHeight: 2.5,
  rotationOffset: 0
};

export function PlayerModel({ pos, rot, name, isLocal, isMoving, isGrounded, isVisible = true }) {
  const groupRef = useRef();
  const circleRef = useRef();
  const innerRef = useRef();
  const mixerRef = useRef();
  const activeActionName = useRef('idle');

  const fbxMain = useLoader(FBXLoader, MODEL_SETTINGS.mainModel);
  const fbxAnims = useLoader(FBXLoader, MODEL_SETTINGS.basicAnims);
  const texture = useLoader(TextureLoader, MODEL_SETTINGS.texturePath);

  const [instance, actions] = useMemo(() => {
    if (!fbxMain || !fbxAnims) return [null, {}];

    // 1. Mesh klonen
    const clonedScene = SkeletonUtils.clone(fbxMain);
    
    // 2. Alle Bones im Klon finden und Namen säubern
    const boneMap = {};
    clonedScene.traverse(child => {
      if (child.isBone) {
        child.name = child.name.replace(/.*[:|]/, "");
        boneMap[child.name] = child;
      }
    });

    // 3. SkinnedMeshes neu binden
    clonedScene.traverse(child => {
      if (child.isSkinnedMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.userData.noCollision = true;

        if (texture) {
          texture.colorSpace = THREE.SRGBColorSpace;
          child.material.map = texture;
          child.material.needsUpdate = true;
        }

        // Wir erstellen ein neues Skelett aus den tatsächlich im Klon vorhandenen Bones
        const newBones = [];
        child.skeleton.bones.forEach(oldBone => {
          const cleanName = oldBone.name.replace(/.*[:|]/, "");
          if (boneMap[cleanName]) {
            newBones.push(boneMap[cleanName]);
          } else {
            newBones.push(oldBone); // Fallback
          }
        });

        child.bind(new THREE.Skeleton(newBones), child.matrixWorld);
      }
    });

    const mixer = new THREE.AnimationMixer(clonedScene);
    mixerRef.current = mixer;
    const newActions = {};

    // 4. Animationen laden und Tracks anpassen
    fbxAnims.animations.forEach(originalClip => {
      const clip = originalClip.clone();
      
      // Jede Spur im Clip säubern, damit sie zu den gesäuberten Bone-Namen passt
      clip.tracks.forEach(track => {
        track.name = track.name.replace(/.*[:|]/, "");
        
        // Root Motion Fix für die Hüfte
        if (track.name.includes('Hips.position')) {
          const v = track.values;
          for (let i = 0; i < v.length; i += 3) {
            v[i] = 0; 
            v[i+2] = 0;
          }
        }
      });

      const nameLower = clip.name.toLowerCase();
      const action = mixer.clipAction(clip);
      
      // Mapping basierend auf deinen Take-Namen
      if (nameLower.includes('idle_a')) newActions['idle'] = action;
      if (nameLower.includes('spawn_air')) newActions['jump'] = action;
      if (nameLower.includes('spawn_ground')) newActions['walk'] = action;
    });

    // Start-Animation (Idle)
    if (newActions['idle']) {
        newActions['idle'].reset().play();
    }

    return [clonedScene, newActions];
  }, [fbxMain, fbxAnims, texture]);

  // 5. Animations-Controller
  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) return;

    let next = 'idle';
    if (!isGrounded) next = 'jump';
    else if (isMoving) next = 'walk';

    const nextAction = actions[next] || actions['idle'];

    if (activeActionName.current !== next) {
      const currentAction = actions[activeActionName.current];
      if (currentAction) {
        currentAction.fadeOut(0.2);
      }
      
      nextAction
        .reset()
        .setEffectiveTimeScale(1)
        .setEffectiveWeight(1)
        .fadeIn(0.2)
        .play();
        
      activeActionName.current = next;
    }
  }, [isMoving, isGrounded, actions]);

  useFrame((state, delta) => {
    if (mixerRef.current) {
        mixerRef.current.update(delta);
    }
    
    if (groupRef.current && rot) {
      groupRef.current.rotation.y = rot[1] + MODEL_SETTINGS.rotationOffset;
    }
    if (innerRef.current) {
      innerRef.current.position.set(0, MODEL_SETTINGS.groundOffset, 0);
    }
    if (circleRef.current) {
      circleRef.current.rotation.z -= delta * 0.8;
    }
  });

  return (
    <group 
      ref={groupRef} 
      position={pos} 
      scale={MODEL_SETTINGS.scale} 
      visible={isVisible} 
      userData={{ noCollision: true }}
    >
      {instance && <primitive ref={innerRef} object={instance} />}
      
      <mesh
        ref={circleRef}
        position={[0, MODEL_SETTINGS.groundOffset + 0.05, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        userData={{ noCollision: true }}
      >
        <ringGeometry args={[1.2, 1.5, 32]} />
        <meshBasicMaterial
          color={isLocal ? "#f5f542" : "#ff0000"}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {!isLocal && (
        <Billboard position={[0, MODEL_SETTINGS.nameTagHeight, 0]}>
          <Text fontSize={0.4} color="#ffffff" outlineWidth={0.04} outlineColor="#000">
            {name || "Player"}
          </Text>
        </Billboard>
      )}
    </group>
  );
}