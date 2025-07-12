// types/robotArm.ts
export interface Angles {
  base: number;
  shoulder: number;
  arm: number;
}

export interface AngleLimits {
  min: number;
  max: number;
}

export interface JointLimits {
  base: AngleLimits;
  shoulder: AngleLimits;
  arm: AngleLimits;
}

export interface ComponentProps {
  angle: number;
  children?: React.ReactNode;
}

export interface RoboticArmProps {
  angles: Angles;
  scale?: number;
}

export interface ArmContainerProps {
  initialAngles?: Angles;
  onAnglesChange?: (angles: Angles) => void;
  showControls?: boolean;
  limits?: JointLimits;
}
