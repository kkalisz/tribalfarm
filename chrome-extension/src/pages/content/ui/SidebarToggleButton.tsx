import React from "react";
import { Button } from "@chakra-ui/react";

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

  // Determine the default aria-label if not provided
  const defaultAriaLabel = isVisible 
    ? `Collapse ${position} sidebar` 
    : `Expand ${position} sidebar`;

  return (
    <Button
      color="amber.100"
      bg="yellow.300"
      fontWeight="bold"
      borderRadius="md"
      borderWidth="2px"
      borderColor="amber.950"
      boxShadow="inner"
      h="8"
      w="8"
      _hover={{ bg: "amber.700" }}
      onClick={onClick}
      aria-expanded={isVisible}
      aria-label={defaultAriaLabel}
    >
      {icon}
    </Button>
  );
};
