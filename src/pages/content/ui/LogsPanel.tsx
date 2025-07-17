import React, { useState, useMemo } from "react";
import { 
  Box, 
  Text, 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
  Input, 
  Select, 
  HStack, 
  Badge,
  Flex
} from "@chakra-ui/react";
import { useGameDatabase } from '@src/shared/contexts/StorageContext';
import { useAsync } from '@src/shared/hooks/useAsync';
import { Log, LogSeverity } from '@src/shared/log/Log';
import { LogFilterParams } from '@src/shared/db/logs';

// Helper function to format timestamp
const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

// Helper function to get severity badge color
const getSeverityColor = (severity: LogSeverity): string => {
  switch (severity) {
    case LogSeverity.DEBUG:
      return "gray";
    case LogSeverity.INFO:
      return "blue";
    case LogSeverity.WARNING:
      return "yellow";
    case LogSeverity.ERROR:
      return "red";
    default:
      return "gray";
  }
};

export const LogsPanel: React.FC = () => {
  const gameDatabase = useGameDatabase();
  const [searchText, setSearchText] = useState<string>("");
  const [severityFilter, setSeverityFilter] = useState<LogSeverity | "">("");
  
  // Create filter params based on severity filter
  const filterParams: LogFilterParams | undefined = useMemo(() => {
    if (severityFilter) {
      return { severity: severityFilter as LogSeverity };
    }
    return undefined;
  }, [severityFilter]);

  // Fetch logs with filter
  const { data: logsData, loading, error } = useAsync(() => {
    return gameDatabase.logsDb.getLogs({
      limit: 100,
      direction: 'desc'
    }, filterParams);
  }, [filterParams]);

  // Apply text search filter on client side
  const filteredLogs = useMemo(() => {
    if (!logsData?.logs) return [];
    
    if (!searchText) return logsData.logs;
    
    const lowerSearchText = searchText.toLowerCase();
    return logsData.logs.filter(log => 
      log.content.toLowerCase().includes(lowerSearchText) ||
      log.type.toLowerCase().includes(lowerSearchText) ||
      (log.sourceVillage?.toString() || "").includes(lowerSearchText)
    );
  }, [logsData, searchText]);

  return (
    <Box 
      p={4} 
      display="flex" 
      flexDirection="column" 
      height="100%" 
    >
      <Text fontWeight="bold" mb={4}>Logs</Text>
      
      {/* Search and Filter Controls */}
      <HStack spacing={4} mb={4}>
        <Input
          placeholder="Search logs..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          size="sm"
          flex="1"
        />
        <Select
          placeholder="Filter by severity"
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value as LogSeverity | "")}
          size="sm"
          width="200px"
        >
          <option value="">All Severities</option>
          {Object.values(LogSeverity).map((severity) => (
            <option key={severity} value={severity}>
              {severity}
            </option>
          ))}
        </Select>
      </HStack>
      
      {/* Logs Table Container - Takes remaining height */}
      <Box 
        flex="1" 
        bg="tribal.cardSecondary" 
        borderRadius="md" 
        fontSize="sm" 
        display="flex" 
        flexDirection="column" 
        overflow="auto"
        height="100%"
        sx={{ overflow: "auto !important" }}
      >
        {loading ? (
          <Flex justify="center" align="center" p={4}>
            <Text>Loading logs...</Text>
          </Flex>
        ) : error ? (
          <Flex justify="center" align="center" p={4}>
            <Text color="red.500">Error loading logs: {error.message}</Text>
          </Flex>
        ) : filteredLogs.length === 0 ? (
          <Flex justify="center" align="center" p={4}>
            <Text color="gray.500">No logs available.</Text>
          </Flex>
        ) : (
          <Box 
            width="100%" 
            height="100%" 
            display="flex" 
            flexDirection="column"
            overflow="auto"
            sx={{ height: "100% !important", overflow: "auto !important" }}
          >
            <Table variant="simple" size="sm" layout="fixed" width="100%">
              <Thead position="sticky" top={0} bg="tribal.cardSecondary" zIndex={1}>
                <Tr>
                  <Th width="150px">Timestamp</Th>
                  <Th width="100px">Severity</Th>
                  <Th width="120px">Type</Th>
                  <Th width="100px">Village ID</Th>
                  <Th>Content</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredLogs.map((log) => (
                  <Tr key={log.id}>
                    <Td width="150px" whiteSpace="nowrap">{formatTimestamp(log.timestamp)}</Td>
                    <Td width="100px">
                      <Badge colorScheme={getSeverityColor(log.severity)}>
                        {log.severity}
                      </Badge>
                    </Td>
                    <Td width="120px">{log.type}</Td>
                    <Td width="100px">{log.sourceVillage || "-"}</Td>
                    <Td whiteSpace="pre-wrap" overflow="hidden" textOverflow="ellipsis">
                      {log.content}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>
    </Box>
  );
};