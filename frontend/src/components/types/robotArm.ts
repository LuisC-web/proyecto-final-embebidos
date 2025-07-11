// types/robotArm.ts
export interface JointAngles {
  base: number;
  shoulder: number;
  elbow: number;
}

export interface JointLimits {
  min: number;
  max: number;
}

export interface RobotArmConfig {
  joints: {
    base: JointLimits;
    shoulder: JointLimits;
    elbow: JointLimits;
  };
  segments: {
    baseHeight: number;
    shoulderLength: number;
    elbowLength: number;
    baseRadius: number;
  };
  baseGeometry: {
    type: "cylinder" | "box" | "custom";
    dimensions: number[];
    color: string;
  };
}

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface RobotArmState {
  joints: JointAngles;
  endEffectorPosition: Position3D;
  isMoving: boolean;
}

export type JointName = keyof JointAngles;

export interface APIResponse {
  success: boolean;
  message?: string;
  data?: JointAngles;
}
