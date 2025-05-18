import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Reads the content of a file and returns it as a string.
 * The file should be located relative to the calling file's directory.
 *
 * @param fileName - The name of the file to read.
 * @param basePath - Optional base path to resolve the file (defaults to current folder).
 * @returns The content of the file as a string.
 */
export function loadFileAsString(fileName: string, basePath: string = __dirname): string {
  const filePath = resolve(basePath, fileName);
  return readFileSync(filePath, 'utf-8');
}