import React from "react";
import { Box, Text } from "@chakra-ui/react";

export const SidebarSettingsPanel: React.FC = () => (
  <Box p={4} height="100%" overflow="auto" display="flex" flexDirection="column">
    <Text fontWeight="bold" mb={2}>Sidebar Settings</Text>
    {/* Add settings controls here */}
    <Text color="gray.500">Settings content goes here.</Text>
  </Box>
);
