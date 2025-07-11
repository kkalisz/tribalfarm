import { FC } from "react";
import { 
  Select, 
  SelectProps, 
  Box, 
  useMultiStyleConfig, 
  ChakraComponent,
  forwardRef
} from "@chakra-ui/react";

/**
 * TribalSelect Component
 * 
 * A select component with a Tribal Wars aesthetic for choosing from options.
 * 
 * @param size - Select size: "md" (default) or "sm"
 * @param variant - Select variant: "standard" (default) or "multiple"
 * @param children - Option elements to be displayed inside the select
 */
interface TribalSelectProps extends Omit<SelectProps, 'size' | 'variant'> {
  size?: "md" | "sm";
  variant?: "standard" | "multiple";
}

const TribalSelect: FC<TribalSelectProps> = forwardRef<TribalSelectProps, 'select'>(({
  size = "md",
  variant = "standard",
  children,
  ...rest
}, ref) => {
  // Size-specific styles
  const sizeStyles = {
    md: {
      height: "38px",
      fontSize: "sm",
      px: 3,
    },
    sm: {
      height: "30px",
      fontSize: "xs",
      px: 2,
    },
  };

  // Custom styles for the select
  const customStyles = {
    field: {
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
      ...sizeStyles[size],
    },
    icon: {
      color: "tribal.primaryBorder",
    },
  };

  // Custom dropdown icon
  const CustomIcon = () => (
    <Box
      as="svg"
      viewBox="0 0 24 24"
      width="1.5em"
      height="1.5em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      mr={2}
      color="tribal.primaryBorder"
    >
      <path d="M6 9l6 6 6-6" />
    </Box>
  );

  return (
    <Select
      ref={ref}
      icon={<CustomIcon />}
      multiple={variant === "multiple"}
      sx={{
        "& > option": {
          bg: "tribal.primaryBg",
          color: "tribal.primaryText",
        },
        "&": {
          ...customStyles.field,
        },
        "& + .chakra-select__icon": {
          ...customStyles.icon,
        },
      }}
      {...rest}
    >
      {children}
    </Select>
  );
});

TribalSelect.displayName = "TribalSelect";

export default TribalSelect;