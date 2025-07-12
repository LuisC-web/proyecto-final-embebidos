import type { Angles } from "../types/robotArm";

// utils/angleUtils.ts
export const degreesToRadians = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

export const radiansToDegrees = (radians: number): number => {
  return (radians * 180) / Math.PI;
};

export const clampAngle = (angle: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, angle));
};

export const convertAnglesToRadians = (angles: Angles): Angles => {
  return {
    base: degreesToRadians(angles.base),
    shoulder: degreesToRadians(angles.shoulder),
    arm: degreesToRadians(angles.arm),
  };
};

export const convertAnglesToDegrees = (angles: Angles): Angles => {
  return {
    base: radiansToDegrees(angles.base),
    shoulder: radiansToDegrees(angles.shoulder),
    arm: radiansToDegrees(angles.arm),
  };
};
