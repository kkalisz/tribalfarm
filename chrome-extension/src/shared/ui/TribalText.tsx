import { FC, ReactNode } from "react";
import { Text, TextProps } from "@chakra-ui/react";

/**
 * TribalText Component
 * 
 * A text component with a Tribal Wars aesthetic for displaying text content.
 * 
 * @param variant - Text style variant: "body" (default), "small", or "emphasis"
 * @param children - Content to be displayed inside the text component
 */
interface TribalTextProps extends Omit<TextProps, 'variant'> {
  variant?: "body" | "small" | "emphasis";
}

const TribalText: FC<TribalTextProps> = ({
  variant = "body",
  children,
  ...rest
}) => {
  // Variant-specific styles
  const variantStyles = {
    body: {
      fontSize: "sm",
      fontWeight: "normal",
      lineHeight: "tall",
    },
    small: {
      fontSize: "xs",
      fontWeight: "normal",
      lineHeight: "tall",
      color: "tribal.secondaryText",
    },
    emphasis: {
      fontSize: "sm",
      fontWeight: "bold",
      fontStyle: "italic",
      lineHeight: "tall",
    },
  };

  // Common styles for all variants
  const commonStyles = {
    color: "tribal.primaryText",
    fontFamily: "body",
  };

  // Combine styles
  const textStyles = {
    ...commonStyles,
    ...variantStyles[variant],
  };

  return (
    <Text {...textStyles} {...rest}>
      {children}
    </Text>
  );
};

export default TribalText;