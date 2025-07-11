
export interface Coordinates {
  x: number;
  y: number;
}

export const coordinatesToString = (coordinates: Coordinates) => `(${coordinates.x}|${coordinates.y})`;