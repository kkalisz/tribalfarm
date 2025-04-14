import React from "react";
import {twMerge} from "tailwind-merge";
import {Button} from "@headlessui/react";

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
    <Button
      className={twMerge("text-amber-100 bg-yellow-300 font-bold rounded-md border-2 border-amber-950 shadow-inner h-8 w-8 hover:bg-amber-700", className)}
      onClick={onClick}
      aria-expanded={isVisible}
      aria-label={defaultAriaLabel}
    >
      {icon}
    </Button>
  );
};
