import fs from 'fs';
import { randomInt } from 'crypto';
import { v4 as uuidV4 } from 'uuid';
export function generateRandomDigitsCode(length: number): string {
	return randomInt(10 ** (length - 1), 10 ** length - 1).toString();
}

export function generateUUID(): string {
	return uuidV4();
}

export function readFile(path: string): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		fs.readFile(path, 'utf8', (err, data) => (err ? reject(err) : resolve(data)));
	});
}
