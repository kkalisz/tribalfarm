import React, { forwardRef } from "react";
import { 
  Input, 
  InputProps, 
  Textarea, 
  TextareaProps, 
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage
} from "@chakra-ui/react";

/**
 * TribalInput Component
 * 
 * A text input component with a Tribal Wars aesthetic for entering text.
 * 
 * @param size - Input size: "md" (default) or "sm"
 * @param variant - Input variant: "standard" (default) or "textarea"
 * @param label - Optional label for the input
 * @param helperText - Optional helper text to display below the input
 * @param errorMessage - Optional error message to display when input is invalid
 * @param isInvalid - Whether the input is invalid
 */
interface TribalInputProps extends Omit<InputProps & TextareaProps, 'size' | 'variant'> {
  size?: "md" | "sm";
  variant?: "standard" | "textarea";
  label?: string;
  helperText?: string;
  errorMessage?: string;
}

const TribalInput = forwardRef<HTMLInputElement | HTMLTextAreaElement, TribalInputProps>(({
  size = "md",
  variant = "standard",
  label,
  helperText,
  errorMessage,
  isInvalid,
  ...rest
}, ref) => {
  // Size-specific styles
  const sizeStyles: Record<"md" | "sm", any> = {
    md: {
      height: (variant as "standard" | "textarea") === "textarea" ? "auto" : "38px",
      fontSize: "sm",
      px: 3,
      py: (variant as "standard" | "textarea") === "textarea" ? 2 : undefined,
    },
    sm: {
      height: (variant as "standard" | "textarea") === "textarea" ? "auto" : "30px",
      fontSize: "xs",
      px: 2,
      py: (variant as "standard" | "textarea") === "textarea" ? 1 : undefined,
    },
  };

  // Common styles for all input variants
  const commonStyles = {
    bg: "tribal.primaryBg",
    color: "tribal.primaryText",
    borderColor: "tribal.primaryBorder",
    borderWidth: "2px",
    borderRadius: "md",
    fontFamily: "body",
    _hover: {
      borderColor: "tribal.accent",
    },
    _focus: {
      borderColor: "tribal.accent",
      boxShadow: "0 0 0 1px var(--chakra-colors-tribal-accent)",
    },
    _placeholder: {
      color: "tribal.secondaryText",
      opacity: 0.7,
    },
    _invalid: {
      borderColor: "tribal.error",
      boxShadow: "0 0 0 1px var(--chakra-colors-tribal-error)",
    },
    ...sizeStyles[size],
  };

  // Label styles
  const labelStyles = {
    color: "tribal.primaryText",
    fontFamily: "heading",
    fontSize: (size as "md" | "sm") === "md" ? "sm" : "xs",
    fontWeight: "bold",
    mb: 1,
  };

  // Helper text styles
  const helperTextStyles = {
    color: "tribal.secondaryText",
    fontSize: "xs",
    mt: 1,
  };

  // Error message styles
  const errorStyles = {
    color: "tribal.error",
    fontSize: "xs",
    mt: 1,
  };

  // Render the appropriate input component based on the variant
  const InputComponent = (variant as "standard" | "textarea") === "textarea" ? (
    <Textarea
      ref={ref as React.RefObject<HTMLTextAreaElement>}
      sx={commonStyles}
      isInvalid={isInvalid}
      minH={(size as "md" | "sm") === "md" ? "100px" : "80px"}
      {...rest}
    />
  ) : (
    <Input
      ref={ref as React.RefObject<HTMLInputElement>}
      sx={commonStyles}
      isInvalid={isInvalid}
      {...rest}
    />
  );

  // If there's a label, wrap in FormControl
  if (label || helperText || errorMessage) {
    return (
      <FormControl isInvalid={isInvalid}>
        {label && <FormLabel sx={labelStyles}>{label}</FormLabel>}
        {InputComponent}
        {helperText && !isInvalid && (
          <FormHelperText sx={helperTextStyles}>{helperText}</FormHelperText>
        )}
        {errorMessage && isInvalid && (
          <FormErrorMessage sx={errorStyles}>{errorMessage}</FormErrorMessage>
        )}
      </FormControl>
    );
  }

  // Otherwise, just return the input component
  return InputComponent;
});

TribalInput.displayName = "TribalInput";

export default TribalInput;
