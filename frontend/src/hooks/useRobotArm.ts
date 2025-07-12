// hooks/useRoboticArmWithLimits.ts
import { useState, useCallback } from "react";
import type { Angles, JointLimits } from "../types/robotArm";
import { clampAngle, degreesToRadians } from "../utils/utils";

interface UseRoboticArmProps {
  initialAngles?: Angles;
  limits: JointLimits;
  useDegrees?: boolean;
}

export const useRoboticArmWithLimits = ({
  initialAngles = { base: 0, shoulder: 0, arm: 0 },
  limits,
  useDegrees = true,
}: UseRoboticArmProps) => {
  const [angles, setAngles] = useState<Angles>(initialAngles);

  const updateAngle = useCallback(
    (joint: keyof Angles, delta: number) => {
      setAngles((prev) => {
        const newAngle = clampAngle(
          prev[joint] + delta,
          limits[joint].min,
          limits[joint].max
        );

        return {
          ...prev,
          [joint]: newAngle,
        };
      });
    },
    [limits]
  );

  const setAngle = useCallback(
    (joint: keyof Angles, value: number) => {
      setAngles((prev) => {
        const clampedValue = clampAngle(
          value,
          limits[joint].min,
          limits[joint].max
        );

        return {
          ...prev,
          [joint]: clampedValue,
        };
      });
    },
    [limits]
  );

  const getRadianAngles = useCallback(() => {
    if (useDegrees) {
      return {
        base: degreesToRadians(angles.base),
        shoulder: degreesToRadians(angles.shoulder),
        arm: degreesToRadians(angles.arm),
      };
    }
    return angles;
  }, [angles, useDegrees]);

  return {
    angles,
    radianAngles: getRadianAngles(),
    updateAngle,
    setAngle,
    setAngles,
    limits,
  };
};
