import React, { FC } from "react";
import { keyframes } from "@emotion/react";
import TribalButton, { TribalButtonProps } from "@src/shared/ui/TribalButton";
import { useTheme } from "@chakra-ui/react";

/**
 * Props for the BlinkingButton component.
 *
 * @param isBlinking - Whether the blinking effect should be applied.
 * @param blinkingPrimary - The primary background color for blinking.
 * @param blinkingSecondary - The secondary background color for blinking.
 */
interface BlinkingButtonProps extends TribalButtonProps {
  isBlinking?: boolean;
  blinkingPrimary?: string;
  blinkingSecondary?: string;
}

// BlinkingButton Component
const BlinkingButton: FC<BlinkingButtonProps> = ({
                                                   isBlinking = false,
                                                   blinkingPrimary,
                                                   blinkingSecondary,
                                                   children,
                                                   ...rest
                                                 }) => {
  const theme = useTheme();

  // Fallback to theme colors if no colors are provided
  const primaryBg = blinkingPrimary || theme.colors.tribal.primaryBg;
  const secondaryBg = blinkingSecondary || theme.colors.tribal.hover;

  // Define animation using dynamic colors
  const blinkAnimation = keyframes`
    0% { background-color: ${primaryBg}; }
    50% { background-color: ${secondaryBg}; }
    100% { background-color: ${primaryBg}; }
  `;

  // Apply animation styles if blinking
  const blinkingStyles = isBlinking
    ? {
      animation: `${blinkAnimation} 1.5s infinite ease-in-out`,
    }
    : {};

  return (
    <TribalButton
      {...rest}
      sx={{
        ...blinkingStyles,
      }}
    >
      {children}
    </TribalButton>
  );
};

export default BlinkingButton;