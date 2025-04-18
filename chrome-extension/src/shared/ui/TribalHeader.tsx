import React, { FC, ReactNode } from "react";
import { Box, Flex, Heading, HeadingProps } from "@chakra-ui/react";

/**
 * TribalHeader Component
 * 
 * A header component with a Tribal Wars aesthetic for section titles and navigation.
 * 
 * @param variant - Header style variant: "main" (default), "section", or "subsection"
 * @param children - Content to be displayed inside the header
 * @param leftDecoration - Optional decorative element to display on the left side
 * @param rightDecoration - Optional decorative element to display on the right side
 */
interface TribalHeaderProps extends Omit<HeadingProps, 'variant'> {
  variant?: "main" | "section" | "subsection";
  leftDecoration?: ReactNode;
  rightDecoration?: ReactNode;
}

const TribalHeader: FC<TribalHeaderProps> = ({
  variant = "main",
  leftDecoration,
  rightDecoration,
  children,
  ...rest
}) => {
  // Variant-specific styles
  const variantStyles = {
    main: {
      fontSize: "3xl",
      py: 3,
      px: 4,
      borderWidth: "3px",
      mb: 4,
    },
    section: {
      fontSize: "xl",
      py: 2,
      px: 3,
      borderWidth: "2px",
      mb: 3,
    },
    subsection: {
      fontSize: "lg",
      py: 1,
      px: 2,
      borderWidth: "1px",
      mb: 2,
    },
  };

  // Common styles for all variants
  const commonStyles = {
    bg: "tribal.secondaryBg",
    color: "tribal.secondaryText",
    borderColor: "tribal.secondaryBorder",
    borderRadius: "md",
    fontFamily: "heading",
    fontWeight: "bold",
    width: "100%",
    position: "relative",
    _before: variant === "main" ? {
      content: '""',
      position: "absolute",
      bottom: "-6px",
      left: "50%",
      transform: "translateX(-50%)",
      width: "80%",
      height: "1px",
      bg: "tribal.accent",
    } : undefined,
  };

  // Combine styles
  const headerStyles = {
    ...commonStyles,
    ...variantStyles[variant],
  };

  // If there are decorations, use a Flex container
  if (leftDecoration || rightDecoration) {
    return (
      // @ts-ignore
      <Box as="header" {...headerStyles} {...rest}>
        <Flex align="center" justify="space-between">
          {leftDecoration && (
            <Box mr={2} fontSize={variantStyles[variant].fontSize}>
              {leftDecoration}
            </Box>
          )}
          <Heading 
            as={variant === "main" ? "h1" : variant === "section" ? "h2" : "h3"}
            fontSize={variantStyles[variant].fontSize}
            fontWeight="bold"
            fontFamily="heading"
            textAlign="center"
            flex="1"
          >
            {children}
          </Heading>
          {rightDecoration && (
            <Box ml={2} fontSize={variantStyles[variant].fontSize}>
              {rightDecoration}
            </Box>
          )}
        </Flex>
      </Box>
    );
  }

  // Simple header without decorations
  return (
    // @ts-ignore
    <Heading
      as={variant === "main" ? "h1" : variant === "section" ? "h2" : "h3"}
      {...headerStyles}
      {...rest}
      textAlign="center"
    >
      {children}
    </Heading>
  );
};

export default TribalHeader;