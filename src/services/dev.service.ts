import RedisCache from './redis.service';
import {
	IRedisUserTripData,
	redisGetTripExperiences,
	redisGetUsersInTripExperinceRange,
	redisGetTripCurrentExpIndex,
	redisGetLeaderboard,
	redisGetUserTripData,
	redisUpdateUserTripData,
} from './trip.service';

/**
 * Dev version of redisGetTripExperiences that returns empty array instead of throwing error
 */
export const devRedisGetTripExperiences = async (tripId: string) => {
	try {
		return await redisGetTripExperiences(tripId);
	} catch (error) {
		console.log(`[DEV] Error in redisGetTripExperiences: ${error.message}`);
		return [];
	}
};

/**
 * Dev version of redisGetUsersInTripExperinceRange that returns empty array instead of throwing error
 */
export const devRedisGetUsersInTripExperinceRange = async (tripId: string) => {
	try {
		return await redisGetUsersInTripExperinceRange(tripId);
	} catch (error) {
		console.log(`[DEV] Error in redisGetUsersInTripExperinceRange: ${error.message}`);
		return [];
	}
};

/**
 * Dev version of redisGetTripCurrentExpIndex that returns 0 instead of throwing error
 */
export const devRedisGetTripCurrentExpIndex = async (tripId: string) => {
	try {
		return await redisGetTripCurrentExpIndex(tripId);
	} catch (error) {
		console.log(`[DEV] Error in redisGetTripCurrentExpIndex: ${error.message}`);
		return 0;
	}
};

/**
 * Dev version of redisGetLeaderboard that returns empty array instead of throwing error
 */
export const devRedisGetLeaderboard = async (tripId: string) => {
	try {
		return await redisGetLeaderboard(tripId);
	} catch (error) {
		console.log(`[DEV] Error in redisGetLeaderboard: ${error.message}`);
		return [];
	}
};

/**
 * Dev version of redisGetUserTripData that returns default data instead of throwing error
 */
export const devRedisGetUserTripData = async (tripId: string, userId: string) => {
	try {
		return await redisGetUserTripData(tripId, userId);
	} catch (error) {
		console.log(`[DEV] Error in redisGetUserTripData: ${error.message}`);
		return {
			imageUrl: 'default-image.jpg',
			name: 'Dev User',
			score: [0],
			finishedExperiences: [false],
		} as IRedisUserTripData;
	}
};

/**
 * Dev version of redisUpdateUserTripData that returns default data instead of throwing error
 */
export const devRedisUpdateUserTripData = async (tripId: string, userId: string, data: Partial<IRedisUserTripData>) => {
	try {
		return await redisUpdateUserTripData(tripId, userId, data);
	} catch (error) {
		console.log(`[DEV] Error in redisUpdateUserTripData: ${error.message}`);
		// Return merged data with defaults
		return {
			imageUrl: 'default-image.jpg',
			name: 'Dev User',
			score: data.score || [0],
			finishedExperiences: data.finishedExperiences || [false],
		} as IRedisUserTripData;
	}
};

/**
 * Force set a Redis key (for debugging)
 */
export const devSetRedisKey = async (key: string, value: any, expirationTime: number = 60 * 60 * 24) => {
	try {
		await RedisCache.setKeyWithValue({ key, value, expirationTime });
		return { success: true, message: `Key ${key} set successfully` };
	} catch (error) {
		console.log(`[DEV] Error in devSetRedisKey: ${error.message}`);
		return { success: false, message: error.message };
	}
};
