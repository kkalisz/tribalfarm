import { FC } from "react";
import { Box, Switch, SwitchProps, Text } from "@chakra-ui/react";

/**
 * TribalSwitch Component
 * 
 * A switch component with a Tribal Wars aesthetic for toggling options.
 * 
 * @param size - Switch size: "md" (default) or "sm"
 * @param children - Label content to be displayed next to the switch
 */
interface TribalSwitchProps extends Omit<SwitchProps, 'size'> {
  size?: "md" | "sm";
}

const TribalSwitch: FC<TribalSwitchProps> = ({
  size = "md",
  children,
  ...rest
}) => {
  // Font size based on switch size
  const fontSize = size === "md" ? "sm" : "xs";

  return (
    <Box display="flex" alignItems="center">
      <Switch 
        size={size}
        sx={{
          '& .chakra-switch__track': {
            bg: 'tribal.secondaryBg',
          },
          '& .chakra-switch__track[data-checked]': {
            bg: 'tribal.accent',
          },
          '& .chakra-switch__thumb': {
            bg: 'tribal.primaryBg',
          },
          '&:hover .chakra-switch__track[data-checked]': {
            bg: 'tribal.hover',
          }
        }}
        {...rest}
      />
      {children && (
        <Text
          ml={2}
          fontSize={fontSize}
          fontFamily="body"
          color="tribal.primaryText"
        >
          {children}
        </Text>
      )}
    </Box>
  );
};

export default TribalSwitch;
