import React, {useState, useMemo, useCallback, useRef} from "react";
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
  Flex,
  useToast,
  Tooltip
} from "@chakra-ui/react";
import { useGameDatabase } from '@src/shared/contexts/StorageContext';
import { useAsync } from '@src/shared/hooks/useAsync';
import { Log, LogSeverity } from '@src/shared/log/Log';
import { LogFilterParams } from '@src/shared/db/logs';
import TribalInput from '@src/shared/ui/TribalInput';
import TribalSelect from '@src/shared/ui/TribalSelect';
import TribalButton from '@src/shared/ui/TribalButton';
import TribalCard from '@src/shared/ui/TribalCard';

// Helper function to format timestamp
const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
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
  const toast = useToast();
  const [searchText, setSearchText] = useState<string>("");
  const [severityFilter, setSeverityFilter] = useState<LogSeverity | "">("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Create filter params based on severity filter
  const filterParams: LogFilterParams | undefined = useMemo(() => {
    if (severityFilter) {
      return { severity: severityFilter as LogSeverity };
    }
    return undefined;
  }, [severityFilter]);

  // Fetch logs with filter
  const { data: logsData, loading, error, execute: refreshLogs } = useAsync(() => {
    return gameDatabase.logsDb.getLogs({
      limit: 100,
      direction: 'desc'
    }, filterParams);
  }, [filterParams]);

  const handleDeleteAllLogs = useCallback(async () => {
    try {
      await gameDatabase.logsDb.deleteAllLogs();
      await refreshLogs();;
    } catch (error) {
      console.log(error);
    }
  }, [gameDatabase, refreshLogs, toast]);

  const filteredLogs = useMemo(() => {
    if (!logsData?.logs) return [];

    if (!searchText) return logsData.logs;

    const lowerSearchText = searchText.toLowerCase();
    return logsData.logs.filter(log => 
      log.content.toLowerCase().includes(lowerSearchText) ||
      log.type.toLowerCase().includes(lowerSearchText) ||
      (log.sourceVillage?.toString() ?? "").includes(lowerSearchText)
    );
  }, [logsData, searchText]);

  return (
    <HStack
      ref={containerRef}
      display="flex"
      flexDirection="column" 
      height="100%" 
    >
      <Flex justify="space-between" width="100%" gap={2}>
        <TribalInput
          flex="1"
          size="sm"
          placeholder="Search logs..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <TribalSelect
          size="sm"
          width="auto"
          minWidth="150px"
          placeholder="Filter by severity"
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value as LogSeverity | "")}
        >
          <option value="">All Severities</option>
          {Object.values(LogSeverity).map((severity) => (
            <option key={severity} value={severity}>
              {severity}
            </option>
          ))}
        </TribalSelect>
        <TribalButton
          onClick={handleDeleteAllLogs}
          whiteSpace="nowrap"
          width="auto"
        >
          Delete All Logs
        </TribalButton>
      </Flex>

      {/* Logs Table Container - Takes remaining height */}
      <TribalCard
        contentPadding="0px"
        style={{ flex: "1", flexDirection: "column", overflow: "auto", width: "100%", height: "100%", padding: "0px" }}
      >
        {loading && (
          <Flex justify="center" align="center" p={4}>
            <Text>Loading logs...</Text>
          </Flex>
        )}
        { error && (
          <Flex justify="center" align="center" p={4}>
            <Text color="red.500">Error loading logs: {error.message}</Text>
          </Flex>
        )}
        {filteredLogs.length === 0 && (
          <Flex justify="center" align="center" p={4}>
            <Text color="gray.500">No logs available.</Text>
          </Flex>
        )}
        {!!filteredLogs.length && (
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
                  <Th width="70px">Time</Th>
                  <Th width="24px">S</Th>
                  <Th width="120px">Type</Th>
                  <Th width="100px">Village ID</Th>
                  <Th>Content</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredLogs.map((log) => (
                  <Tr key={log.id}>
                    <Td width="70px" fontSize="xs" whiteSpace="nowrap">{formatTimestamp(log.timestamp)}</Td>
                    <Td width="24px" textAlign="center">
                      <Tooltip label={log.severity} hasArrow  portalProps={{ containerRef: containerRef}}>
                        <Badge 
                          colorScheme={getSeverityColor(log.severity)} 
                          borderRadius="full" 
                          display="inline-flex"
                          justifyContent="center"
                          alignItems="center"
                        >
                          {log.severity.charAt(0)}
                        </Badge>
                      </Tooltip>
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
      </TribalCard>
    </HStack>
  );
};
