const RedisTripKeys = {
	tripsListKey: (userId: string, page: number, limit: number): string =>
		`trips/getAll?page=${page}&limit=${limit}:${userId}`,

	tripsListPatternByUser: (userId: string): string => `trips/getAll?page=*&limit=*:${userId}`,

	tripById: (tripId: string): string => `trip/byId:${tripId}`,
};

export default RedisTripKeys;
