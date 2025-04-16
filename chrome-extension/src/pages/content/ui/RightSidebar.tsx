import React from "react";
import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import {SidebarToggleButton} from "@pages/content/ui/SidebarToggleButton";
import TribalCard from "@src/shared/ui/TribalCard";

interface RightSidebarProps {
    rightSidebarVisible: boolean;
    setRightSidebarVisible: (visible: boolean) => Promise<void>;
    logs: string[];
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
                                                              rightSidebarVisible,
                                                              setRightSidebarVisible,
                                                              logs
                                                          }) => {
    return (
        <Box
            position="fixed"
            top="0"
            right="0"
            height="full"
            overflowY="auto"
            width="25%"
            pointerEvents={rightSidebarVisible ? "auto" : "none"}
        >
            <Flex p={2} justifyContent="flex-end" pointerEvents="auto">
                <SidebarToggleButton
                    isVisible={rightSidebarVisible}
                    onClick={() => setRightSidebarVisible(!rightSidebarVisible)}
                    position="right"
                />
            </Flex>

            {/* Sidebar Content - Completely hidden when not visible */}
            {rightSidebarVisible && (
                <Box
                    height="full"
                    overflowY="auto"
                    pointerEvents="auto"
                >
                    <TribalCard title="Logs">
                        <Box mt={2} fontSize="sm">
                            {logs.map((log, index) => (
                                <Text key={index}>{log}</Text>
                            ))}
                        </Box>
                    </TribalCard>
                </Box>
            )}
        </Box>
    );
};
