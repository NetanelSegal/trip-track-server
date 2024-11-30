import fs from 'fs';
import { randomInt } from 'crypto';
export function generateRandomDigitsCode(length: number): string {
  return randomInt(10 ** (length - 1), 10 ** length - 1).toString();
}

export function readFile(path: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) =>
      err ? reject(err) : resolve(data)
    );
  });
}
