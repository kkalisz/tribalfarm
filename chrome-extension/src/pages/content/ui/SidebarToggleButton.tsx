import React from "react";

interface SidebarToggleButtonProps {
  isVisible: boolean;
  onClick: () => void;
  position: "left" | "right";
}

export const SidebarToggleButton: React.FC<SidebarToggleButtonProps> = ({
  isVisible,
  onClick,
  position,
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
      className="text-white font-bold py-1 px-2 rounded focus:outline-none focus:ring-2 focus:ring-green-300 pointer-events-auto"
      onClick={onClick}
      aria-expanded={isVisible}
      aria-label={defaultAriaLabel}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '30px',
        height: '30px',
        padding: 0,
        borderRadius: '50%',
      }}
    >
      {icon}
    </button>
  );
};
