import { FC } from "react";
import { Text, TextProps } from "@chakra-ui/react";

/**
 * TribalLink Component
 *
 * A link component with a Tribal Wars aesthetic, designed to be bold and clickable.
 *
 * @param children - Content to be displayed inside the link
 * @param onClick - Function to be called when the link is clicked
 */
interface TribalLinkProps extends Omit<TextProps, "variant"> {
  onClick?: () => void;
}

const TribalLink: FC<TribalLinkProps> = ({
  children,
  onClick,
  ...rest
}) => {
  return (
    <Text
      size="sm"
      color="tribal.primaryBorder"
      cursor="pointer"
      fontWeight="bold"
      onClick={onClick}
      {...rest}
    >
      {children}
    </Text>
  );
};

export default TribalLink;