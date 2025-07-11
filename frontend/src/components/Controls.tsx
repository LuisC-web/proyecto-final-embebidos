// components/Controls.tsx
import React from "react";
import type {
  JointAngles,
  JointName,
  Position3D,
  RobotArmConfig,
} from "./types/robotArm";

interface ControlsProps {
  joints: JointAngles;
  endEffectorPosition: Position3D;
  config: RobotArmConfig;
  isMoving: boolean;
  onJointUpdate: (jointName: JointName, value: number) => void;
  onReset: () => void;
  onPresetMove?: (preset: JointAngles) => void;
}

const Controls: React.FC<ControlsProps> = ({
  joints,
  endEffectorPosition,
  config,
  isMoving,
  onJointUpdate,
  onReset,
  onPresetMove,
}) => {
  const handleSliderChange = (jointName: JointName, value: string): void => {
    const numericValue = parseFloat(value);
    onJointUpdate(jointName, numericValue);
  };

  const presetPositions: Record<string, JointAngles> = {
    home: { base: 0, shoulder: 0, elbow: 0 },
    reach: { base: 45, shoulder: 30, elbow: -60 },
    fold: { base: 0, shoulder: -45, elbow: 90 },
  };

  const formatPosition = (pos: Position3D): string => {
    return `(${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)})`;
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        left: "20px",
        background: "rgba(0,0,0,0.9)",
        padding: "20px",
        borderRadius: "10px",
        color: "white",
        minWidth: "300px",
      }}
    >
      <h3>Control del Brazo Robótico</h3>

      {/* Estado del sistema */}
      <div
        style={{
          marginBottom: "20px",
          padding: "10px",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "5px",
        }}
      >
        <p>
          <strong>Estado:</strong> {isMoving ? "Moviendo..." : "Estático"}
        </p>
        <p>
          <strong>Posición Final:</strong> {formatPosition(endEffectorPosition)}
        </p>
      </div>

      {/* Controles de articulaciones */}
      {(Object.keys(joints) as JointName[]).map((jointName) => {
        const limits = config.joints[jointName];
        const currentValue = joints[jointName];

        return (
          <div key={jointName} style={{ marginBottom: "15px" }}>
            <label>
              {jointName.charAt(0).toUpperCase() + jointName.slice(1)}(
              {limits.min}° - {limits.max}°): {currentValue.toFixed(1)}°
            </label>
            <input
              type="range"
              min={limits.min}
              max={limits.max}
              step="0.1"
              value={currentValue}
              onChange={(e) => handleSliderChange(jointName, e.target.value)}
              disabled={isMoving}
              style={{
                width: "100%",
                marginTop: "5px",
                opacity: isMoving ? 0.5 : 1,
              }}
            />
          </div>
        );
      })}

      {/* Botones de control */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginTop: "20px",
        }}
      >
        <button
          onClick={onReset}
          disabled={isMoving}
          style={{
            background: "#ff4444",
            color: "white",
            border: "none",
            padding: "10px 15px",
            borderRadius: "5px",
            cursor: isMoving ? "not-allowed" : "pointer",
            opacity: isMoving ? 0.5 : 1,
          }}
        >
          Reset
        </button>

        {onPresetMove &&
          Object.entries(presetPositions).map(([name, position]) => (
            <button
              key={name}
              onClick={() => onPresetMove(position)}
              disabled={isMoving}
              style={{
                background: "#4444ff",
                color: "white",
                border: "none",
                padding: "10px 15px",
                borderRadius: "5px",
                cursor: isMoving ? "not-allowed" : "pointer",
                opacity: isMoving ? 0.5 : 1,
              }}
            >
              {name}
            </button>
          ))}
      </div>
    </div>
  );
};

export default Controls;
