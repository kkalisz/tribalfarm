import { FC, ReactNode } from "react";
import { FormLabel, FormLabelProps } from "@chakra-ui/react";

/**
 * TribalFormLabel Component
 * 
 * A form label component with a Tribal Wars aesthetic for form fields.
 * 
 * @param size - Label size: "md" (default) or "sm"
 * @param required - Whether the field is required
 * @param children - Label text content
 */
interface TribalFormLabelProps extends Omit<FormLabelProps, 'size'> {
  size?: "md" | "sm";
  required?: boolean;
  children: ReactNode;
}

const TribalFormLabel: FC<TribalFormLabelProps> = ({
  size = "md",
  children,
  required,
  ...rest
}) => {
  // Size-specific styles
  const sizeStyles = {
    md: {
      fontSize: "sm",
      mb: 1,
    },
    sm: {
      fontSize: "xs",
      mb: 0.5,
    },
  };

  return (
    <FormLabel
      fontSize={sizeStyles[size].fontSize}
      mb={sizeStyles[size].mb}
      fontFamily="heading"
      fontWeight="medium"
      color="tribal.primaryText"
      _after={required ? {
        content: '" *"',
        color: "tribal.secondaryBorder",
        ml: 1,
      } : undefined}
      {...rest}
    >
      {children}
    </FormLabel>
  );
};

export default TribalFormLabel;