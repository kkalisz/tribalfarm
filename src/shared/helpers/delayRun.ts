export async function delayRun(timeInMs: number) {
  const timeOfDelay = timeInMs;
  return new Promise(resolve => setTimeout(resolve, timeOfDelay));
}

export async function delayRunRandom(minDelayMs: number, maxDelayMs: number) {
  const delay = Math.floor(Math.random() * (maxDelayMs - minDelayMs + 1)) + minDelayMs;
  await delayRun(delay);
}