import { FC } from "react";
import { Box, Checkbox, CheckboxProps, useCheckbox, useMultiStyleConfig } from "@chakra-ui/react";

/**
 * TribalCheckbox Component
 * 
 * A checkbox component with a Tribal Wars aesthetic for toggling options.
 * 
 * @param size - Checkbox size: "md" (default) or "sm"
 * @param children - Label content to be displayed next to the checkbox
 */
interface TribalCheckboxProps extends Omit<CheckboxProps, 'size'> {
  size?: "md" | "sm";
}

const TribalCheckbox: FC<TribalCheckboxProps> = ({
  size = "md",
  children,
  ...rest
}) => {
  // Size-specific styles
  const sizeStyles = {
    md: {
      boxSize: "20px",
      borderWidth: "2px",
      fontSize: "sm",
    },
    sm: {
      boxSize: "16px",
      borderWidth: "1px",
      fontSize: "xs",
    },
  };

  // Custom styles for the checkbox
  const customStyles = {
    control: {
      bg: "tribal.primaryBg",
      borderColor: "tribal.primaryBorder",
      borderWidth: sizeStyles[size].borderWidth,
      borderRadius: "sm",
      boxSize: sizeStyles[size].boxSize,
      _hover: {
        borderColor: "tribal.accent",
      },
      _checked: {
        bg: "tribal.primaryBg",
        borderColor: "tribal.primaryBorder",
        color: "tribal.accent",
        _hover: {
          bg: "tribal.primaryBg",
          borderColor: "tribal.accent",
        },
      },
      _focus: {
        boxShadow: "outline",
      },
    },
    label: {
      fontSize: sizeStyles[size].fontSize,
      fontFamily: "body",
      color: "tribal.primaryText",
      ml: 2,
    },
    container: {
      alignItems: "center",
    },
  };

  return (
    <Checkbox
      sx={{
        ".chakra-checkbox__control": {
          ...customStyles.control,
        },
        ".chakra-checkbox__label": {
          ...customStyles.label,
        },
        "&": {
          ...customStyles.container,
        },
      }}
      iconColor="tribal.accent"
      iconSize={size === "md" ? "12px" : "10px"}
      {...rest}
    >
      {children}
    </Checkbox>
  );
};

export default TribalCheckbox;