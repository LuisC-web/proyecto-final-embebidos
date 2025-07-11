// components/RoboticArm.tsx
import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Mesh, MeshStandardMaterial } from "three";
import type { JointAngles, RobotArmConfig } from "./types/robotArm";

interface RoboticArmProps {
  joints: JointAngles;
  config: RobotArmConfig;
  onJointUpdate?: (jointName: keyof JointAngles, angle: number) => void;
}

const RoboticArm: React.FC<RoboticArmProps> = ({
  joints,
  config,
  onJointUpdate,
}) => {
  const baseRef = useRef<Group>(null);
  const shoulderRef = useRef<Group>(null);
  const elbowRef = useRef<Group>(null);
  const endEffectorRef = useRef<Mesh>(null);

  // Convertir grados a radianes
  const baseRad = (joints.base * Math.PI) / 180;
  const shoulderRad = (joints.shoulder * Math.PI) / 180;
  const elbowRad = (joints.elbow * Math.PI) / 180;

  useEffect(() => {
    if (baseRef.current) {
      baseRef.current.rotation.y = baseRad;
    }
    if (shoulderRef.current) {
      shoulderRef.current.rotation.x = shoulderRad;
    }
    if (elbowRef.current) {
      elbowRef.current.rotation.x = elbowRad;
    }
  }, [baseRad, shoulderRad, elbowRad]);

  // Animación suave del efector final
  useFrame((state) => {
    if (endEffectorRef.current) {
      const mat = endEffectorRef.current.material;
      if (mat && "emissive" in mat) {
        (mat as MeshStandardMaterial).emissive.setHex(
          Math.sin(state.clock.elapsedTime * 2) > 0 ? 0x440000 : 0x000000
        );
      }
    }
  });

  return (
    <group>
      {/* Base del brazo */}
      <group ref={baseRef}>
        <mesh position={[0, config.segments.baseHeight / 2, 0]}>
          <cylinderGeometry args={[0.3, 0.3, config.segments.baseHeight]} />
          <meshStandardMaterial color="#444444" />
        </mesh>

        {/* Primer segmento (hombro) */}
        <group ref={shoulderRef} position={[0, config.segments.baseHeight, 0]}>
          <mesh position={[0, config.segments.shoulderLength / 2, 0]}>
            <boxGeometry args={[0.2, config.segments.shoulderLength, 0.2]} />
            <meshStandardMaterial color="#666666" />
          </mesh>

          {/* Articulación del hombro */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.15]} />
            <meshStandardMaterial color="#333333" />
          </mesh>

          {/* Segundo segmento (codo) */}
          <group
            ref={elbowRef}
            position={[0, config.segments.shoulderLength, 0]}
          >
            <mesh position={[0, config.segments.elbowLength / 2, 0]}>
              <boxGeometry args={[0.15, config.segments.elbowLength, 0.15]} />
              <meshStandardMaterial color="#888888" />
            </mesh>

            {/* Articulación del codo */}
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.12]} />
              <meshStandardMaterial color="#333333" />
            </mesh>

            {/* Efector final */}
            <mesh
              ref={endEffectorRef}
              position={[0, config.segments.elbowLength, 0]}
            >
              <sphereGeometry args={[0.1]} />
              <meshStandardMaterial color="#ff4444" />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
};

export default RoboticArm;
