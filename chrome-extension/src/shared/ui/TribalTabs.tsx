import { FC, ReactNode } from "react";
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  TabsProps,
  TabListProps,
  TabProps,
  TabPanelsProps,
  TabPanelProps,
  Box
} from "@chakra-ui/react";

/**
 * TribalTabs Component
 * 
 * A tabs component with a Tribal Wars aesthetic for organizing content into tabbed sections.
 * 
 * @param variant - Tabs style variant: "enclosed" (default) or "line"
 * @param size - Tabs size: "md" (default) or "sm"
 * @param children - Should include TabList and TabPanels components
 */
interface TribalTabsProps extends Omit<TabsProps, 'variant' | 'size'> {
  variant?: "enclosed" | "line";
  size?: "md" | "sm";
  children: ReactNode;
}

/**
 * TribalTabList Component
 * 
 * Container for tab buttons with Tribal Wars styling.
 */
export const TribalTabList: FC<TabListProps> = ({ children, ...rest }) => {
  return (
    <TabList
      mb={2}
      p={1}
      borderRadius="xl"
      bg="tribal.secondaryBg"
      borderWidth="2px"
      borderColor="tribal.primaryBorder"
      {...rest}
    >
      {children}
    </TabList>
  );
};

/**
 * TribalTab Component
 * 
 * Individual tab button with Tribal Wars styling.
 */
export const TribalTab: FC<TabProps> = ({ children, ...rest }) => {
  return (
    <Tab
      width="full"
      borderRadius="lg"
      py={2}
      fontSize="sm"
      fontWeight="medium"
      fontFamily="heading"
      color="tribal.primaryText"
      _selected={{
        bg: "tribal.accent",
        color: "tribal.primaryText",
        boxShadow: "md",
        borderWidth: "1px",
        borderColor: "tribal.primaryBorder"
      }}
      _hover={{
        bg: "tribal.hover",
        color: "tribal.primaryText"
      }}
      {...rest}
    >
      {children}
    </Tab>
  );
};

/**
 * TribalTabPanels Component
 * 
 * Container for tab panels with Tribal Wars styling.
 */
export const TribalTabPanels: FC<TabPanelsProps> = ({ children, ...rest }) => {
  return (
    <TabPanels {...rest}>
      {children}
    </TabPanels>
  );
};

/**
 * TribalTabPanel Component
 * 
 * Individual tab panel with Tribal Wars styling.
 */
export const TribalTabPanel: FC<TabPanelProps> = ({ children, ...rest }) => {
  return (
    <TabPanel
      borderRadius="xl"
      bg="tribal.primaryBg"
      p={3}
      color="tribal.primaryText"
      borderWidth="2px"
      borderColor="tribal.primaryBorder"
      {...rest}
    >
      {children}
    </TabPanel>
  );
};

/**
 * Main TribalTabs component that composes the tab system
 */
export const TribalTabs: FC<TribalTabsProps> = ({
  variant = "enclosed",
  size = "md",
  children,
  ...rest
}) => {
  // Size-specific styles
  const sizeStyles = {
    md: {
      fontSize: "sm",
      tabPadding: 2,
    },
    sm: {
      fontSize: "xs",
      tabPadding: 1,
    },
  };

  return (
    <Tabs
      variant={variant}
      colorScheme="tribal"
      size={size}
      {...rest}
    >
      <Box
        sx={{
          ".chakra-tabs__tablist": {
            mb: 2,
            p: 1,
            borderRadius: "xl",
            bg: "tribal.secondaryBg",
            borderWidth: "2px",
            borderColor: "tribal.primaryBorder",
          },
          ".chakra-tabs__tab": {
            width: "full",
            borderRadius: "lg",
            py: sizeStyles[size].tabPadding,
            fontSize: sizeStyles[size].fontSize,
            fontWeight: "medium",
            fontFamily: "heading",
            color: "tribal.primaryText",
            _selected: {
              bg: "tribal.accent",
              color: "tribal.primaryText",
              boxShadow: "md",
              borderWidth: "1px",
              borderColor: "tribal.primaryBorder"
            },
            _hover: {
              bg: "tribal.hover",
              color: "tribal.primaryText"
            }
          },
          ".chakra-tabs__tab-panel": {
            borderRadius: "xl",
            bg: "tribal.primaryBg",
            p: 3,
            color: "tribal.primaryText",
            borderWidth: "2px",
            borderColor: "tribal.primaryBorder",
          }
        }}
      >
        {children}
      </Box>
    </Tabs>
  );
};
