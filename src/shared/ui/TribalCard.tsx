import React, {FC, PropsWithChildren, useRef} from "react";
import {Box, Flex, Tooltip, Icon} from "@chakra-ui/react";
import {QuestionIcon} from "@chakra-ui/icons";

/**
 * TribalCard Component
 *
 * A container for related content with a Tribal Wars aesthetic.
 *
 * @param title - Optional header title
 * @param helpText - Optional help text to display in a tooltip when hovering over the question mark icon
 * @param variant - Card style variant: "standard" (default), "simple", or "highlighted"
 * @param style - Optional CSS properties to apply to the card
 * @param gap - Optional spacing between child elements
 * @param contentPadding - Optional padding for the content area
 * @param noBorder - Optional flag to disable the border
 * @param children - Content to be displayed inside the card
 */
interface TribalCardProps {
  title?: string;
  helpText?: string;
  variant?: "standard" | "simple" | "highlighted" | "secondary";
  style?: React.CSSProperties;
  gap?: string | number;
  contentPadding?: string | number;
  noBorder?: boolean;
}

const TribalCard: FC<PropsWithChildren<TribalCardProps>> = ({
  title,
  helpText,
  variant = "standard",
  style,
  gap,
  contentPadding,
  noBorder = false,
  children
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
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
          ref={containerRef}
        >
          <Flex align="center" justify="space-between">
            {title}
            {helpText && (
              <Tooltip label={helpText} hasArrow portalProps={{ containerRef: containerRef }}>
                <Box cursor="help">
                  <Icon as={QuestionIcon} boxSize="12px" color="tribal.cardHeaderText" opacity={0.7} />
                </Box>
              </Tooltip>
            )}
          </Flex>
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
