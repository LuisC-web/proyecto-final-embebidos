import React, { useRef, useCallback, useState, useEffect } from "react";

interface JoystickValue {
  angle?: number;
  distance: number;
  direction: string;
}

interface CustomJoystickProps {
  onChange: (value: JoystickValue) => void;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "accent";
  lockAxis?: "none" | "horizontal" | "vertical"; // ✅ Nueva prop para bloquear ejes
}

const Joystick: React.FC<CustomJoystickProps> = ({
  onChange,
  size = "md",
  variant = "primary",
  lockAxis = "none", // ✅ Por defecto sin bloqueo
}) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-32 h-32",
    lg: "w-40 h-40",
  };

  const baseClasses = {
    primary: "bg-gray-200 border-gray-400",
    secondary: "bg-blue-100 border-blue-300",
    accent: "bg-yellow-100 border-yellow-400",
  };

  const stickClasses = {
    primary: "bg-gray-600 border-gray-800",
    secondary: "bg-blue-600 border-blue-800",
    accent: "bg-yellow-600 border-yellow-800",
  };

  const maxDistance = size === "sm" ? 28 : size === "md" ? 44 : 60;

  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (!joystickRef.current) return;

    setIsDragging(true);
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    handleMove(clientX - centerX, clientY - centerY);
  }, []);

  const handleMove = useCallback(
    (deltaX: number, deltaY: number) => {
      // ✅ Aplicar bloqueo de ejes
      let constrainedDeltaX = deltaX;
      let constrainedDeltaY = deltaY;

      if (lockAxis === "horizontal") {
        constrainedDeltaY = 0; // Bloquear movimiento vertical
      } else if (lockAxis === "vertical") {
        constrainedDeltaX = 0; // Bloquear movimiento horizontal
      }

      const distance = Math.sqrt(
        constrainedDeltaX * constrainedDeltaX +
          constrainedDeltaY * constrainedDeltaY
      );
      const clampedDistance = Math.min(distance, maxDistance);

      let normalizedX = 0;
      let normalizedY = 0;

      if (distance > 0) {
        normalizedX = (constrainedDeltaX / distance) * clampedDistance;
        normalizedY = (constrainedDeltaY / distance) * clampedDistance;
      }

      setPosition({ x: normalizedX, y: normalizedY });

      // ✅ Calcular ángulo con valores restringidos
      const angle =
        distance > 5
          ? Math.atan2(-constrainedDeltaY, constrainedDeltaX) * (180 / Math.PI)
          : undefined;
      const normalizedDistance = clampedDistance / maxDistance;

      onChange({
        angle,
        distance: normalizedDistance,
        direction: distance > 5 ? "Move" : "Center",
      });
    },
    [maxDistance, onChange, lockAxis] // ✅ Agregar lockAxis a dependencias
  );

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    setPosition({ x: 0, y: 0 });
    onChange({ angle: undefined, distance: 0, direction: "Center" });
  }, [onChange]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleStart(e.clientX, e.clientY);
    },
    [handleStart]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !joystickRef.current) return;

      const rect = joystickRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      handleMove(e.clientX - centerX, e.clientY - centerY);
    },
    [isDragging, handleMove]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) handleEnd();
  }, [isDragging, handleEnd]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);
    },
    [handleStart]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || !joystickRef.current) return;
      e.preventDefault();

      const touch = e.touches[0];
      const rect = joystickRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      handleMove(touch.clientX - centerX, touch.clientY - centerY);
    },
    [isDragging, handleMove]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      e.preventDefault();
      if (isDragging) handleEnd();
    },
    [isDragging, handleEnd]
  );

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd, { passive: false });
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [
    isDragging,
    handleMouseMove,
    handleMouseUp,
    handleTouchMove,
    handleTouchEnd,
  ]);

  // ✅ Estilos visuales para indicar el bloqueo
  const getAxisIndicatorStyle = () => {
    if (lockAxis === "horizontal") {
      return "after:content-[''] after:absolute after:top-1/2 after:left-2 after:right-2 after:h-0.5 after:bg-red-400 after:transform after:-translate-y-1/2";
    } else if (lockAxis === "vertical") {
      return "after:content-[''] after:absolute after:left-1/2 after:top-2 after:bottom-2 after:w-0.5 after:bg-red-400 after:transform after:-translate-x-1/2";
    }
    return "";
  };

  return (
    <div
      ref={joystickRef}
      className={`
        ${sizeClasses[size]} 
        ${baseClasses[variant]}
        rounded-full border-2 relative cursor-pointer
        touch-none select-none shadow-lg
        hover:shadow-xl transition-shadow duration-200
        active:scale-95 transform
        ${getAxisIndicatorStyle()}
      `}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div
        className={`
          w-8 h-8 rounded-full border-2 absolute
          ${stickClasses[variant]}
          shadow-md
          ${isDragging ? "" : "transition-all duration-200 ease-out"}
        `}
        style={{
          left: `calc(50% + ${position.x}px - 1rem)`,
          top: `calc(50% + ${position.y}px - 1rem)`,
        }}
      />
    </div>
  );
};

export default Joystick;
