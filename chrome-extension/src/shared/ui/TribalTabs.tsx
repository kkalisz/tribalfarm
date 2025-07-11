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
  variant?: "enclosed" | "line" | "unstyled";
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
      p={2}
      gap={2}
      borderRadius="none"
      bg="tribal.cardSecondary"
      borderWidth="2x"
      borderColor="tribal.primaryBorder"
      {...rest}
    >
      {children}
    </TabList>
  );
};

export const TribalSimpleTabList: FC<TabListProps> = ({ children, ...rest }) => {
  return (
    <TabList
      mb={2}
      gap={2}
      borderRadius="none"
      bg="transparent"
      borderWidth="0x"
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
      borderRadius="none"
      py={2}
      fontSize="sm"
      fontWeight="medium"
      bg={"tribal.cardPrimary"}
      fontFamily="heading"
      borderWidth="1px"
      borderColor="tribal.primaryBorder"
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
      borderRadius="none"
      bg="tribal.cardPrimary"
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

  return (
    <Tabs
      variant={variant}
      colorScheme="tribal"
      size={size}
      {...rest}
    >
      <Box>
        {children}
      </Box>
    </Tabs>
  );
};
