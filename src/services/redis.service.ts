import { createClient, RedisClientType } from 'redis';
import { REDIS_URL } from '../env.config';
import { Logger } from '../utils/Logger';
import { AppError } from '../utils/AppError';

interface IRedisCacheProps<T> {
	key: string;
	callbackFn: () => Promise<T>;
	expirationTime: number;
}

interface IRedisSetValueProps<T> {
	key: string;
	value: T;
	expirationTime: number;
}

interface ISortedSetMember {
	score: number;
	value: string;
}

interface ISortedSetMember {
	score: number;
	value: string;
}

class RedisDAL {
	private static MAX_RECONNECT_ATTEMPTS = 3;
	private reconnectAttempts = 0;
	private redisClient: RedisClientType;

	constructor() {
		this.redisClient = createClient({
			socket: {
				reconnectStrategy: (attempts) => Math.min(attempts * 1000, 5000),
			},
			url: REDIS_URL,
		});

		this.connect().catch((error) => Logger.error(error));

		this.redisClient.on('error', async (err) => {
			if (err.code === 'ECONNREFUSED') {
				if (this.reconnectAttempts > RedisDAL.MAX_RECONNECT_ATTEMPTS) {
					await this.redisClient.disconnect();
					this.reconnectAttempts = 0;
				} else {
					err.message = 'Error connecting to Redis - Attempts: ' + this.reconnectAttempts;
					this.reconnectAttempts++;
				}
			}
			Logger.error(err);
		});
	}

	private async connect(): Promise<void> {
		await this.redisClient.connect();
		if (this.redisClient.isOpen) {
			Logger.success('Connected to Redis');
		} else {
			throw new AppError('RedisConnectionError', 'Could not connect to Redis', 500, 'Redis');
		}
	}

	private async ensureConnected(): Promise<void> {
		if (this.redisClient.isOpen) return;
		await this.connect();
	}

	async getSetValue<T>({ key, callbackFn, expirationTime }: IRedisCacheProps<T>): Promise<T> {
		try {
			await this.ensureConnected();
			const redisData = await this.redisClient.GET(key);
			if (redisData) return JSON.parse(redisData) as T;

			const newValue = await callbackFn();
			await this.redisClient.SETEX(key, expirationTime, JSON.stringify(newValue));
			return newValue;
		} catch (error) {
			throw new AppError(error.name, error.message, 500, 'Redis');
		}
	}

	async getValueByKey<T>(key: string): Promise<T | null> {
		try {
			await this.ensureConnected();
			const redisData = await this.redisClient.GET(key);
			return redisData ? (JSON.parse(redisData) as T) : null;
		} catch (error) {
			throw new AppError(error.name, error.message, 500, 'Redis');
		}
	}

	async setKeyWithCallback<T>({ key, callbackFn, expirationTime }: IRedisCacheProps<T>): Promise<string> {
		try {
			await this.ensureConnected();
			const value = await callbackFn();
			return await this.redisClient.SETEX(key, expirationTime, JSON.stringify(value));
		} catch (error) {
			throw new AppError(error.name, error.message, 500, 'Redis');
		}
	}

	async setKeyWithValue<T>({ key, value, expirationTime }: IRedisSetValueProps<T>): Promise<string> {
		try {
			await this.ensureConnected();
			return await this.redisClient.SETEX(key, expirationTime, JSON.stringify(value));
		} catch (error) {
			throw new AppError(error.name, error.message, 500, 'Redis');
		}
	}

	async deleteKey(key: string): Promise<number> {
		try {
			await this.ensureConnected();
			return await this.redisClient.DEL(key);
		} catch (error) {
			throw new AppError(error.name, error.message, 500, 'Redis');
		}
	}

	async addToSortedSet(key: string, member: ISortedSetMember): Promise<number> {
		try {
			await this.ensureConnected();
			return await this.redisClient.zAdd(key, member);
		} catch (error) {
			throw new AppError(error.name, error.message, 500, 'Redis');
		}
	}

	async removeFromSortedSet(key: string, member: string): Promise<number> {
		try {
			await this.ensureConnected();
			return await this.redisClient.zRem(key, member);
		} catch (error) {
			if (error instanceof AppError) throw error;
			throw new AppError(error.name, error.message, 500, 'Redis');
		}
	}

	async updateScoreInSortedSet(key: string, member: string, newScore: number): Promise<number> {
		try {
			await this.ensureConnected();
			return await this.redisClient.zAdd(key, {
				score: newScore,
				value: member,
			});
		} catch (error) {
			throw new AppError(error.name, error.message, 500, 'Redis');
		}
	}

	async getMembersFromSortedSet(key: string): Promise<Array<{ score: number; value: string }>> {
		try {
			await this.ensureConnected();
			const members = await this.redisClient.zRangeWithScores(key, 0, -1, {
				REV: true,
			});
			return members;
		} catch (error) {
			throw new AppError(error.name, error.message, 500, 'Redis');
		}
	}

	async addValueToHash<T>(redisKey: string, hashKey: string, value: T): Promise<void> {
		try {
			await this.ensureConnected();
			await this.redisClient.hSet(redisKey, hashKey, JSON.stringify(value));
		} catch (error) {
			throw new AppError(error.name, error.message, 500, 'Redis');
		}
	}

	async removeHashKeyFromHash<T>(redisKey: string, hashKey: string): Promise<{ [hashKey: string]: T }> {
		try {
			await this.ensureConnected();
			const deletedValue = await this.redisClient.hGet(redisKey, hashKey);
			if (deletedValue) {
				await this.redisClient.hDel(redisKey, hashKey);
			} else {
				throw new AppError('HashKey not found', 'HashKey not found', 404, 'Redis');
			}
			return { [hashKey]: JSON.parse(deletedValue) as T };
		} catch (error) {
			if (error instanceof AppError) throw error;
			throw new AppError(error.name, error.message, 500, 'Redis');
		}
	}

	async updateValueInHash<T>(redisKey: string, hashKey: string, value: T): Promise<void> {
		try {
			await this.ensureConnected();
			await this.redisClient.hSet(redisKey, hashKey, JSON.stringify(value));
		} catch (error) {
			throw new AppError(error.name, error.message, 500, 'Redis');
		}
	}

	async initRadisHashKeys<T>(redisKey: string, hashKeys: string[], value: T): Promise<void> {
		try {
			await this.ensureConnected();
			const multi = this.redisClient.multi();
			for (const hashKey of hashKeys) {
				multi.hSet(redisKey, hashKey, JSON.stringify(value));
			}
			await multi.exec();
		} catch (error) {
			throw new AppError(error.name, error.message, 500, 'Redis');
		}
	}

	async getAllValuesFromHash<T>(redisKey: string): Promise<{ [hashKey: string]: T }> {
		try {
			await this.ensureConnected();
			const hashKeys = await this.redisClient.hGetAll(redisKey);

			const result: { [hashKey: string]: T } = {};
			for (const [hashKey, value] of Object.entries(hashKeys)) {
				result[hashKey] = JSON.parse(value) as T;
			}

			return result;
		} catch (error) {
			throw new AppError(error.name, error.message, 500, 'Redis');
		}
	}

	async scanKeys(pattern: string): Promise<string[]> {
		let cursor = 0;
		const keys: string[] = [];

		do {
			const reply = await this.redisClient.scan(cursor, {
				MATCH: pattern,
				COUNT: 100,
			});
			cursor = reply.cursor;
			keys.push(...reply.keys);
		} while (cursor !== 0);

		return keys;
	}
}

const RedisCache = new RedisDAL();
export default RedisCache;
