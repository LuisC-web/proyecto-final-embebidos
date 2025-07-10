// hooks/useRobotArm.ts
import { useState, useCallback, useEffect, useMemo } from "react";
import type {
  JointAngles,
  JointName,
  RobotArmConfig,
  Position3D,
} from "../components/types/robotArm";

interface UseRobotArmProps {
  initialJoints?: JointAngles;
  externalJoints?: JointAngles;
  onJointChange?: (joints: JointAngles) => void;
}

export const useRobotArm = ({
  initialJoints = { base: 0, shoulder: 0, elbow: 0 },
  externalJoints,
  onJointChange,
}: UseRobotArmProps = {}) => {
  const config: RobotArmConfig = {
    joints: {
      base: { min: -90, max: 90 },
      shoulder: { min: -90, max: 90 },
      elbow: { min: -90, max: 90 },
    },
    segments: {
      baseHeight: 1,
      baseRadius: 0.4,
      shoulderLength: 2,
      elbowLength: 2,
    },
    baseGeometry: {
      type: "custom",
      dimensions: [0.8, 1.2, 0.8],
      color: "#2563eb",
    },
  };

  const [joints, setJoints] = useState<JointAngles>(initialJoints);
  const [isMoving, setIsMoving] = useState<boolean>(false);

  // Calcular posición del efector final
  const endEffectorPosition = useMemo((): Position3D => {
    const { base, shoulder, elbow } = joints;
    const { baseHeight, shoulderLength, elbowLength } = config.segments;

    // Conversión a radianes
    const baseRad = (base * Math.PI) / 180;
    const shoulderRad = (shoulder * Math.PI) / 180;
    const elbowRad = (elbow * Math.PI) / 180;

    // Cálculo de posición del efector final
    const shoulderX = shoulderLength * Math.cos(shoulderRad);
    const shoulderY = shoulderLength * Math.sin(shoulderRad);

    const elbowX = shoulderX + elbowLength * Math.cos(shoulderRad + elbowRad);
    const elbowY = shoulderY + elbowLength * Math.sin(shoulderRad + elbowRad);

    return {
      x: elbowX * Math.cos(baseRad),
      y: baseHeight + elbowY,
      z: elbowX * Math.sin(baseRad),
    };
  }, [joints, config.segments]);

  // Actualizar joints cuando cambien los valores externos
  useEffect(() => {
    if (externalJoints) {
      setJoints(externalJoints);
    }
  }, [externalJoints]);

  // Notificar cambios
  useEffect(() => {
    if (onJointChange) {
      onJointChange(joints);
    }
  }, [joints, onJointChange]);

  const updateJoint = useCallback(
    (jointName: JointName, angle: number): void => {
      const limits = config.joints[jointName];
      const clampedAngle = Math.max(limits.min, Math.min(limits.max, angle));

      setJoints((prev) => ({
        ...prev,
        [jointName]: clampedAngle,
      }));
    },
    [config]
  );

  const updateAllJoints = useCallback(
    (newJoints: Partial<JointAngles>): void => {
      const clampedJoints: JointAngles = { ...joints };

      Object.entries(newJoints).forEach(([jointName, angle]) => {
        if (angle !== undefined) {
          const limits = config.joints[jointName as JointName];
          clampedJoints[jointName as JointName] = Math.max(
            limits.min,
            Math.min(limits.max, angle)
          );
        }
      });

      setJoints(clampedJoints);
    },
    [joints, config]
  );

  const resetPosition = useCallback((): void => {
    setJoints({ base: 0, shoulder: 0, elbow: 0 });
  }, []);

  return {
    joints,
    endEffectorPosition, // ← Asegurar que se retorna
    config,
    isMoving,
    updateJoint,
    updateAllJoints,
    resetPosition,
    setIsMoving,
  };
};
