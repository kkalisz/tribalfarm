import React from "react";
import {CommandMessage} from "@src/shared/types";
import { SidebarToggleButton } from "./SidebarToggleButton";
import { Box, Flex, Heading, Text } from "@chakra-ui/react";

interface LeftSidebarProps {
    leftSidebarVisible: boolean;
    setLeftSidebarVisible: (visible: boolean) => Promise<void>;
    commandStatus: string;
    currentCommand: CommandMessage | null;
    lastEvent: string;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
                                                            leftSidebarVisible,
                                                            setLeftSidebarVisible,
                                                            commandStatus,
                                                            currentCommand,
                                                            lastEvent
                                                        }) => {
    return (
        <Box 
            position="fixed" 
            height="full" 
            top="0" 
            left="0" 
            width="25%" 
            pointerEvents={leftSidebarVisible ? "auto" : "none"}
        >
            {/* Toggle Button - Always visible in the same position */}
            <Box position="absolute" top="4" left="4" pointerEvents="auto">
                <SidebarToggleButton
                    isVisible={leftSidebarVisible}
                    onClick={() => setLeftSidebarVisible(!leftSidebarVisible)}
                    position="left"
                />
            </Box>

            {/* Sidebar Content - Completely hidden when not visible */}
            {leftSidebarVisible && (
                <Box 
                    height="full" 
                    bg="blue.500" 
                    color="white"
                    overflowY="auto" 
                    transition="all 0.3s ease-in-out" 
                    width="full"
                    pointerEvents="auto"
                >
                    <Box p={4} mt={10}>
                        <Heading fontWeight="bold" fontSize="lg">Tribal Farm Status</Heading>
                        <Box mt={2}>
                            <Text><strong>Status:</strong> {commandStatus}</Text>
                            {currentCommand && (
                                <Box mt={2}>
                                    <Text><strong>Current Command:</strong></Text>
                                    <Text>Action: {currentCommand.payload.action}</Text>
                                    <Text>ID: {currentCommand.actionId}</Text>
                                </Box>
                            )}
                            {lastEvent && (
                                <Text mt={2}><strong>Last Event:</strong> {lastEvent}</Text>
                            )}
                        </Box>
                    </Box>
                </Box>
            )}
        </Box>
    );
};
