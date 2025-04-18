import React from "react";
import TribalButton from "@src/shared/ui/TribalButton";

interface SidebarToggleButtonProps {
  isVisible: boolean;
  onClick: () => void;
  position: "left" | "right";
}

export const SidebarToggleButton: React.FC<SidebarToggleButtonProps> = ({
  isVisible,
  onClick,
  position
}) => {
  // Determine the icon based on position and visibility
  const icon = position === "left" 
    ? (isVisible ? '◀' : '▶') 
    : (isVisible ? '▶' : '◀');

  return (
    <TribalButton onClick={onClick} pointerEvents="auto" >
      {icon}
    </TribalButton>
  );
};
