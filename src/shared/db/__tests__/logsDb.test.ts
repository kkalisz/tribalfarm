import { GameDataBase } from '../GameDataBase';
import { GameDataBaseAccess } from '../GameDataBaseAcess';
import { Log, LogSeverity } from '@src/shared/log/Log';
import { v4 as uuidv4 } from 'uuid';

describe('LogsDb', () => {
  let gameDataBase: GameDataBase;
  let gameDataBaseAccess: GameDataBaseAccess;

  beforeEach(async () => {
    // Use a unique prefix for each test to avoid conflicts
    const testPrefix = `test_${uuidv4()}`;
    gameDataBase = new GameDataBase(testPrefix);
    await gameDataBase.init();
    gameDataBaseAccess = new GameDataBaseAccess(gameDataBase.db);
  });

  afterEach(async () => {
    // Clean up by deleting all logs
    await gameDataBaseAccess.logsDb.deleteAllLogs();
  });

  test('should save and retrieve a log', async () => {
    // Create a test log
    const testLog = {
      severity: LogSeverity.INFO,
      type: 'TEST',
      timestamp: Date.now(),
      content: 'Test log message'
    };

    // Save the log
    const logId = await gameDataBaseAccess.logsDb.saveLog(testLog);

    // Retrieve the log
    const retrievedLog = await gameDataBaseAccess.logsDb.getLog(logId);

    // Verify the log was saved correctly
    expect(retrievedLog).toBeDefined();
    expect(retrievedLog?.id).toBe(logId);
    expect(retrievedLog?.severity).toBe(testLog.severity);
    expect(retrievedLog?.type).toBe(testLog.type);
    expect(retrievedLog?.timestamp).toBe(testLog.timestamp);
    expect(retrievedLog?.content).toBe(testLog.content);
  });

  test('should save multiple logs', async () => {
    // Create test logs
    const testLogs = [
      {
        severity: LogSeverity.INFO,
        type: 'TEST',
        timestamp: Date.now(),
        content: 'Test log message 1'
      },
      {
        severity: LogSeverity.WARNING,
        type: 'TEST',
        timestamp: Date.now() + 1000,
        content: 'Test log message 2'
      },
      {
        severity: LogSeverity.ERROR,
        type: 'TEST',
        timestamp: Date.now() + 2000,
        content: 'Test log message 3'
      }
    ];

    // Save the logs
    const logIds = await gameDataBaseAccess.logsDb.saveLogs(testLogs);

    // Verify the logs were saved
    expect(logIds.length).toBe(testLogs.length);

    // Retrieve and verify each log
    for (let i = 0; i < logIds.length; i++) {
      const retrievedLog = await gameDataBaseAccess.logsDb.getLog(logIds[i]);
      expect(retrievedLog).toBeDefined();
      expect(retrievedLog?.severity).toBe(testLogs[i].severity);
      expect(retrievedLog?.type).toBe(testLogs[i].type);
      expect(retrievedLog?.timestamp).toBe(testLogs[i].timestamp);
      expect(retrievedLog?.content).toBe(testLogs[i].content);
    }
  });

  test('should retrieve logs with pagination', async () => {
    // Create 20 test logs
    const testLogs = Array.from({ length: 20 }, (_, i) => ({
      severity: i % 2 === 0 ? LogSeverity.INFO : LogSeverity.WARNING,
      type: i % 3 === 0 ? 'TYPE_A' : 'TYPE_B',
      timestamp: Date.now() + i * 1000,
      content: `Test log message ${i + 1}`
    }));

    // Save the logs
    await gameDataBaseAccess.logsDb.saveLogs(testLogs);

    // Retrieve logs with pagination (10 per page)
    const page1 = await gameDataBaseAccess.logsDb.getLogs({ limit: 10, direction: 'asc' });
    
    // Verify first page
    expect(page1.logs.length).toBe(10);
    expect(page1.hasMore).toBe(true);
    expect(page1.nextCursor).toBeDefined();

    // Retrieve second page
    const page2 = await gameDataBaseAccess.logsDb.getLogs({ 
      limit: 10, 
      cursor: page1.nextCursor,
      direction: 'asc' 
    });

    // Verify second page
    expect(page2.logs.length).toBe(10);
    expect(page2.hasMore).toBe(false);
  });

  test('should filter logs by severity', async () => {
    // Create test logs with different severities
    const testLogs = [
      {
        severity: LogSeverity.INFO,
        type: 'TEST',
        timestamp: Date.now(),
        content: 'Info log'
      },
      {
        severity: LogSeverity.WARNING,
        type: 'TEST',
        timestamp: Date.now() + 1000,
        content: 'Warning log'
      },
      {
        severity: LogSeverity.ERROR,
        type: 'TEST',
        timestamp: Date.now() + 2000,
        content: 'Error log'
      }
    ];

    // Save the logs
    await gameDataBaseAccess.logsDb.saveLogs(testLogs);

    // Filter logs by severity
    const infoLogs = await gameDataBaseAccess.logsDb.getLogs(
      { limit: 10 },
      { severity: LogSeverity.INFO }
    );

    // Verify filtering
    expect(infoLogs.logs.length).toBe(1);
    expect(infoLogs.logs[0].severity).toBe(LogSeverity.INFO);
    expect(infoLogs.logs[0].content).toBe('Info log');
  });

  test('should filter logs by type', async () => {
    // Create test logs with different types
    const testLogs = [
      {
        severity: LogSeverity.INFO,
        type: 'TYPE_A',
        timestamp: Date.now(),
        content: 'Type A log'
      },
      {
        severity: LogSeverity.INFO,
        type: 'TYPE_B',
        timestamp: Date.now() + 1000,
        content: 'Type B log'
      },
      {
        severity: LogSeverity.INFO,
        type: 'TYPE_C',
        timestamp: Date.now() + 2000,
        content: 'Type C log'
      }
    ];

    // Save the logs
    await gameDataBaseAccess.logsDb.saveLogs(testLogs);

    // Filter logs by type
    const typeBLogs = await gameDataBaseAccess.logsDb.getLogs(
      { limit: 10 },
      { type: 'TYPE_B' }
    );

    // Verify filtering
    expect(typeBLogs.logs.length).toBe(1);
    expect(typeBLogs.logs[0].type).toBe('TYPE_B');
    expect(typeBLogs.logs[0].content).toBe('Type B log');
  });

  test('should filter logs by timestamp range', async () => {
    const now = Date.now();
    
    // Create test logs with different timestamps
    const testLogs = [
      {
        severity: LogSeverity.INFO,
        type: 'TEST',
        timestamp: now,
        content: 'Log 1'
      },
      {
        severity: LogSeverity.INFO,
        type: 'TEST',
        timestamp: now + 5000,
        content: 'Log 2'
      },
      {
        severity: LogSeverity.INFO,
        type: 'TEST',
        timestamp: now + 10000,
        content: 'Log 3'
      }
    ];

    // Save the logs
    await gameDataBaseAccess.logsDb.saveLogs(testLogs);

    // Filter logs by timestamp range
    const filteredLogs = await gameDataBaseAccess.logsDb.getLogs(
      { limit: 10 },
      { 
        startTimestamp: now + 1000,
        endTimestamp: now + 9000
      }
    );

    // Verify filtering
    expect(filteredLogs.logs.length).toBe(1);
    expect(filteredLogs.logs[0].content).toBe('Log 2');
  });

  test('should delete logs by filter', async () => {
    // Create test logs with different severities
    const testLogs = [
      {
        severity: LogSeverity.INFO,
        type: 'TEST',
        timestamp: Date.now(),
        content: 'Info log'
      },
      {
        severity: LogSeverity.WARNING,
        type: 'TEST',
        timestamp: Date.now() + 1000,
        content: 'Warning log'
      },
      {
        severity: LogSeverity.ERROR,
        type: 'TEST',
        timestamp: Date.now() + 2000,
        content: 'Error log'
      }
    ];

    // Save the logs
    await gameDataBaseAccess.logsDb.saveLogs(testLogs);

    // Delete logs by severity
    const deletedCount = await gameDataBaseAccess.logsDb.deleteLogsByFilter({
      severity: LogSeverity.WARNING
    });

    // Verify deletion
    expect(deletedCount).toBe(1);

    // Verify remaining logs
    const remainingLogs = await gameDataBaseAccess.logsDb.getLogs({ limit: 10 });
    expect(remainingLogs.logs.length).toBe(2);
    expect(remainingLogs.logs.some(log => log.severity === LogSeverity.WARNING)).toBe(false);
  });
});