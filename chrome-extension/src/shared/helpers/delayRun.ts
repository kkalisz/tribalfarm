export async function delayRun(timeInMs: number) {

  //TODO
  const timeOfDelay = timeInMs;
  return new Promise(resolve => setTimeout(resolve, timeOfDelay));

}