import {FC, ReactElement, ReactNode} from "react";
import { Button, ButtonProps, Icon, Flex, Box } from "@chakra-ui/react";

/**
 * TribalButton Component
 * 
 * A button component with a Tribal Wars aesthetic.
 * 
 * @param variant - Button style variant: "primary" (default), "secondary", or "icon"
 * @param size - Button size: "md" (default) or "sm"
 * @param leftIcon - Optional icon to display on the left side of the button
 * @param rightIcon - Optional icon to display on the right side of the button
 * @param isFullWidth - Whether the button should take up the full width of its container
 * @param children - Content to be displayed inside the button
 */
export interface TribalButtonProps extends Omit<ButtonProps, 'variant' | 'size'> {
  variant?: "primary" | "secondary" | "icon";
  size?: "md" | "sm";
  leftIcon?: ReactElement;
  rightIcon?: ReactElement;
}

const TribalButton: FC<TribalButtonProps> = ({
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  children,
  ...rest
}) => {
  // Base styles for all button variants
  const baseStyles = {
    fontFamily: "heading",
    fontWeight: "bold",
    borderWidth: "2px",
    borderRadius: "md",
    boxShadow: "sm",
    _hover: {
      transform: "translateY(-1px)",
      boxShadow: "md",
    },
    _active: {
      transform: "translateY(0)",
      boxShadow: "sm",
    },
    _focus: {
      boxShadow: "outline",
      outline: "none",
    },
  };

  // Variant-specific styles
  const variantStyles = {
    primary: {
      bg: "tribal.primaryBg",
      color: "tribal.primaryText",
      borderColor: "tribal.primaryBorder",
      _hover: {
        ...baseStyles._hover,
        bg: "tribal.hover",
      },
    },
    secondary: {
      bg: "tribal.secondaryBg",
      color: "tribal.secondaryText",
      borderColor: "tribal.secondaryBorder",
      _hover: {
        ...baseStyles._hover,
        bg: "tribal.accent",
        color: "tribal.primaryText",
      },
    },
    icon: {
      bg: "transparent",
      color: "tribal.primaryText",
      borderColor: "tribal.primaryBorder",
      p: 1,
      minW: "auto",
      _hover: {
        ...baseStyles._hover,
        bg: "tribal.primaryBg",
        borderColor: "tribal.primaryBorder",
      },
    },
  };

  // Combine all styles
  const buttonStyles = {
    ...baseStyles,
    ...variantStyles[variant],
  };

  // For icon variant, render a simplified button
  if (variant === "icon" && !children) {
    return (
      <Button {...buttonStyles} {...rest}>
        {leftIcon || rightIcon}
      </Button>
    );
  }

  // For regular buttons with icons
  return (
    <Button {...buttonStyles} {...rest}>
      <Flex align="center" justify="center">
        {leftIcon && <Box mr={2}>{leftIcon}</Box>}
        {children}
        {rightIcon && <Box ml={2}>{rightIcon}</Box>}
      </Flex>
    </Button>
  );
};

export default TribalButton;
