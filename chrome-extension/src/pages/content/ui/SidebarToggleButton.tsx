import React from "react";
import {twMerge} from "tailwind-merge";

interface SidebarToggleButtonProps {
  isVisible: boolean;
  onClick: () => void;
  position: "left" | "right";
  className?: string;
}

export const SidebarToggleButton: React.FC<SidebarToggleButtonProps> = ({
  isVisible,
  onClick,
  position,
    className
}) => {
  // Determine the icon based on position and visibility
  const icon = position === "left" 
    ? (isVisible ? '◀' : '▶') 
    : (isVisible ? '▶' : '◀');

  // Determine the default aria-label if not provided
  const defaultAriaLabel = isVisible 
    ? `Collapse ${position} sidebar` 
    : `Expand ${position} sidebar`;

  return (
    <button
      className={twMerge("text-white font-bold py-1 px-2 rounded focus:outline-none focus:ring-2 focus:ring-green-300 pointer-events-auto", className)}
      onClick={onClick}
      aria-expanded={isVisible}
      aria-label={defaultAriaLabel}
    >
      {icon}
    </button>
  );
};
