"use client";
import { Center, Environment } from "@react-three/drei";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import React, { useRef } from "react";
import * as THREE from "three";
import { MTLLoader, OBJLoader } from "three-stdlib";

interface BackgroundModelProps {
  url: string;
  mtlUrl: string;
  cameraPosition?: [number, number, number];
  lightIntensity?: number;
}

function Model({ url, mtlUrl }: BackgroundModelProps) {
  // 1. Load the MTL materials first with proper texture path resolution
  const materials = useLoader(MTLLoader, mtlUrl, (loader) => {
    // Set the base path for texture loading relative to the MTL file
    const basePath = mtlUrl.substring(0, mtlUrl.lastIndexOf("/") + 1);
    loader.setResourcePath(basePath);
  });

  // 2. Load the OBJ model with materials
  const obj = useLoader(OBJLoader, url, (loader) => {
    materials.preload();
    loader.setMaterials(materials);
  });

  // 2. Type the ref as a THREE.Group
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;

    // Constant slow spin
    groupRef.current.rotation.z += 0.002;

    // Linear Interpolation for smoothness
    groupRef.current.rotation.x = -0.8;
    groupRef.current.rotation.y = -0.4;
  });

  return (
    <Center>
      <primitive ref={groupRef} object={obj} scale={1.5} />
    </Center>
  );
}

export function SpinningModel({
  url,
  mtlUrl,
  cameraPosition = [0, 0, 300],
  lightIntensity = 1,
}: BackgroundModelProps) {
  return (
    <Canvas camera={{ position: cameraPosition, fov: 45 }} gl={{ alpha: true }}>
      {/* Lighting */}
      <ambientLight intensity={lightIntensity * 1.3} />
      <directionalLight position={[5, 5, 5]} intensity={lightIntensity * 0.3} />
      <directionalLight
        position={[-5, -5, -5]}
        intensity={lightIntensity * 0.3}
      />

      {/* Adds realistic reflections */}
      <Environment preset="studio" />
      <Model url={url} mtlUrl={mtlUrl} />
    </Canvas>
  );
}
