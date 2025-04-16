import { FC, PropsWithChildren } from "react";
import { Box } from "@chakra-ui/react";

const TribalCard: FC<PropsWithChildren<{ title?: string }>> = ({ title, children }) => {
    return (
        <Box
            backgroundColor="red"
            borderWidth="2px"
            borderColor="tribal.cardBorder" 
            boxShadow="inner" 
            borderRadius="md" 
            p={2}
        >
            {title && (
                <Box 
                    bg="tribal.cardHeader" 
                    borderWidth="2px" 
                    borderColor="tribal.cardHeaderBorder" 
                    px={2} 
                    py={1} 
                    fontWeight="semibold" 
                    color="tribal.cardHeaderText" 
                    fontSize="sm"
                >
                    {title}
                </Box>
            )}
            <Box px={2} py={1} fontSize="sm" color="tribal.cardText">
                {children}
            </Box>
        </Box>
    );
};

export default TribalCard;
