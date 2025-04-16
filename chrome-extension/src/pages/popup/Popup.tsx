import React, { useState } from 'react';
import logo from '@assets/img/logo.svg';
import { useGuiSettings } from '@src/shared/hooks/useGuiSettings';
import { 
  Box, 
  Flex, 
  Image, 
  Tabs, 
  TabList, 
  Tab, 
  TabPanels, 
  TabPanel, 
  Switch, 
  Button, 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  Text,
  Link,
  Heading,
  FormControl,
  FormLabel
} from '@chakra-ui/react';

export default function Popup() {
  const { gui } = useGuiSettings();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleShowGUIChange = (checked: boolean) => {
    gui.setVisible(checked);
  };

  return (
    <Box position="absolute" top="0" left="0" right="0" bottom="0" textAlign="center" height="full" p={3} bg="gray.800">
      <Flex as="header" flexDirection="column" alignItems="center" justifyContent="center" color="white">
        <Image src={logo} height="36" pointerEvents="none" animation="spin 20s linear infinite" alt="logo" />

        {/* Tabs for different sections */}
        <Box width="full" maxWidth="md" px={2} py={4} sx={{ sm: { px: 0 } }}>
          <Tabs variant="enclosed" colorScheme="blue">
            <TabList mb={2} spacing={1} p={1} borderRadius="xl" bg="blue.900" opacity={0.2}>
              <Tab 
                width="full" 
                borderRadius="lg" 
                py={2} 
                fontSize="sm" 
                fontWeight="medium" 
                _selected={{ bg: "blue.500", color: "white", boxShadow: "md" }}
                _hover={{ bg: "blue.800", color: "white" }}
                color="blue.100"
              >
                Settings
              </Tab>
              <Tab 
                width="full" 
                borderRadius="lg" 
                py={2} 
                fontSize="sm" 
                fontWeight="medium" 
                _selected={{ bg: "blue.500", color: "white", boxShadow: "md" }}
                _hover={{ bg: "blue.800", color: "white" }}
                color="blue.100"
              >
                About
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel borderRadius="xl" bg="gray.700" p={3} color="white">
                <Flex mt={2} alignItems="center" justifyContent="space-between">
                  <FormLabel htmlFor="show-gui" mb={0}>Show GUI</FormLabel>
                  <Switch
                    id="show-gui"
                    isChecked={gui.visible}
                    onChange={(e) => handleShowGUIChange(e.target.checked)}
                    colorScheme="blue"
                    size="md"
                  />
                </Flex>
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  mt={4}
                  borderRadius="md"
                  bg="blue.500"
                  px={4}
                  py={2}
                  color="white"
                  _hover={{ bg: "blue.600" }}
                  _focus={{ outline: "none", ring: 2, ringColor: "blue.500" }}
                >
                  More Info
                </Button>
              </TabPanel>
              <TabPanel borderRadius="xl" bg="gray.700" p={3} color="white">
                <Text fontSize="sm">
                  This is a Chrome extension built with React, TypeScript, and Chakra UI.
                </Text>
                <Text mt={2} fontSize="sm">
                  UI components powered by Chakra UI.
                </Text>
                <Link
                  mt={2}
                  display="block"
                  color="blue.400"
                  href="https://chakra-ui.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more about Chakra UI
                </Link>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Flex>

      {/* Modal for additional information */}
      <Modal isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <ModalOverlay />
        <ModalContent bg="gray.700" color="white" mx={4}>
          <ModalHeader>GUI Settings Information</ModalHeader>
          <ModalBody>
            <Text fontSize="sm">
              Enabling the GUI will show the sidebar interfaces on the webpage.
            </Text>
            <Text mt={4} fontSize="sm">
              The left sidebar shows status information, while the right sidebar displays logs.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={() => setIsDialogOpen(false)}
              mt={2}
              borderRadius="md"
              bg="blue.500"
              px={4}
              py={2}
              color="white"
              _hover={{ bg: "blue.600" }}
              _focus={{ outline: "none", ring: 2, ringColor: "blue.500" }}
            >
              Got it, thanks!
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}