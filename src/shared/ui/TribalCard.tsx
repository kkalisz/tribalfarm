import React, {FC, PropsWithChildren} from "react";
import {Box} from "@chakra-ui/react";

/**
 * TribalCard Component
 *
 * A container for related content with a Tribal Wars aesthetic.
 *
 * @param title - Optional header title
 * @param variant - Card style variant: "standard" (default), "simple", or "highlighted"
 * @param style - Optional CSS properties to apply to the card
 * @param gap - Optional spacing between child elements
 * @param contentPadding - Optional padding for the content area
 * @param noBorder - Optional flag to disable the border
 * @param children - Content to be displayed inside the card
 */
interface TribalCardProps {
  title?: string;
  variant?: "standard" | "simple" | "highlighted" | "secondary";
  style?: React.CSSProperties;
  gap?: string | number;
  contentPadding?: string | number;
  noBorder?: boolean;
}

const TribalCard: FC<PropsWithChildren<TribalCardProps>> = ({
  title,
  variant = "standard",
  style,
  gap,
  contentPadding,
  noBorder = false,
  children
}) => {
  // Determine border color based on variant
  const borderColor = variant === "highlighted"
    ? "tribal.accent"
    : "tribal.primaryBorder";
  const backgroundColor = variant == "secondary" ? "tribal.cardSecondary" : "tribal.cardPrimary"

  return (
    <Box
      width={"full"}
      backgroundColor={backgroundColor}
      borderWidth={noBorder ? "0px" : "1px"}
      borderColor={borderColor}
      boxShadow="inner"
      overflow="auto"
      // borderRadius="md"
      style={style}
      _before={variant === "highlighted" ? {
        content: '""',
        top: "-4px",
        left: "-4px",
        right: "-4px",
        bottom: "-4px",
        borderRadius: "md",
        borderWidth: "1px",
        borderColor: "tribal.accent",
        opacity: 0.6,
        pointerEvents: "none"
      } : undefined}
    >
      {(title && variant !== "simple") && (
        <Box
          bg="tribal.cardHeader"
          borderWidth="0px"
          borderColor="tribal.cardHeaderBorder"
          px={3}
          py={1}
          fontWeight="bold"
          color="tribal.cardHeaderText"
          fontSize="sm"
          fontFamily="heading"
        >
          {title}
        </Box>
      )}
      <Box
        px={contentPadding ?? "2"}
        py={contentPadding ?? "2"}
        fontSize="sm"
        color="tribal.cardText"
        fontFamily="body"
        flex="1"
        display="flex"
        flexDirection="column"
        gap={gap ?? "2"}
        overflow="auto"
      >
        {children}
      </Box>
    </Box>
  );
};

export default TribalCard;
