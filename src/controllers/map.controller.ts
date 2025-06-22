import axios from 'axios';
import { NextFunction, Request, Response } from 'express';
import { MAPBOX_ACCESS_TOKEN } from '../env.config';
import RedisCache from '../services/redis.service';

export const getDirectionsRoute = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { points, language } = req.query;

		const data = await RedisCache.getSetValue({
			key: `mapbox_route:${points}:${language}`,
			callbackFn: async () => {
				const { data } = await axios(
					`https://api.mapbox.com/directions/v5/mapbox/walking/${points}?geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}&steps=true&overview=full&language=${language}`
				);
				return data;
			},
			expirationTime: 60 * 20,
		});

		res.json(data);
	} catch (error) {
		next(error);
	}
};
