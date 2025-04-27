

export const logInfo = (message: any, ...data: any[]) => sendLog(message, "info", ...data);
export const logWarn = (message: any, ...data: any[]) => sendLog(message, "warn", ...data);
export const logError = (message: any, ...data: any[]) => sendLog(message, "error", ...data);

export const sendLog = (message: any, level = "info", ...data: any[]) => {
  const params = data.map(d => d.toString()).join(", ");
  fetch("https://logs-01.loggly.com/inputs/bbc13543-c5e4-4cc6-b308-30b631d96f51/tag/http/", {
    method: "POST",
    body: JSON.stringify({
      level,
      message: message + (params ? ` (${params})` : ""),
      timestamp: new Date().toISOString()
    }),
    headers: {
      "Content-Type": "application/json"
    }
  });
};
