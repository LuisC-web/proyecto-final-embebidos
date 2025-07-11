import { Canvas } from "@react-three/fiber";
import Controls from "./Controls";
import { useRobotArm } from "../hooks/useRobotArm";
import type { JointAngles } from "./types/robotArm";
interface RobotArmContainerProps {
  targetPosition?: JointAngles;
  showControls?: boolean;
  onPositionChange?: (joints: JointAngles) => void;
  initialPosition?: JointAngles;
}
// components/RobotArmContainer.tsx
const RobotArmContainer: React.FC<RobotArmContainerProps> = ({
  targetPosition,
  showControls = true,
  onPositionChange,
  initialPosition,
}) => {
  const {
    joints,
    endEffectorPosition, // ← Desestructurar endEffectorPosition
    config,
    isMoving,
    updateJoint,
    updateAllJoints,
    resetPosition,
  } = useRobotArm({
    initialJoints: initialPosition,
    externalJoints: targetPosition,
    onJointChange: onPositionChange,
  });

  return (
    <div style={{ width: "100%", height: "600px", position: "relative" }}>
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        {/* Canvas content */}
      </Canvas>

      {showControls && (
        <Controls
          joints={joints}
          endEffectorPosition={endEffectorPosition} // ← Pasar endEffectorPosition
          config={config}
          isMoving={isMoving}
          onJointUpdate={updateJoint}
          onReset={resetPosition}
        />
      )}
    </div>
  );
};
export default RobotArmContainer;
