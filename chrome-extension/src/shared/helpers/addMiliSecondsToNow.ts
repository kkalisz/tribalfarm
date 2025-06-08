
export function addMiliSecondsTo(miliSecondsToAdd: number, addTo: Date = new Date()) {
  return new Date(addTo.getTime() + miliSecondsToAdd);
}