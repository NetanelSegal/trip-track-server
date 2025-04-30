import { ExtendedError, Server } from 'socket.io';
import { Logger } from '../utils/Logger';
import http from 'http';
import { AppError, ValidationError } from '../utils/AppError';
import {
	ClientToServerEvents,
	InterServerEvents,
	ServerToClientEvents,
	SocketServer,
	SocketType,
} from '../types/socket';
import { socketEventValidator } from '../middlewares/socketEventValidator';
import { socketDataValidator } from '../middlewares/socketDataValidator';
import { socketDataSchema } from '../validationSchemas/socketSchemas';

import {
	redisGetUserTripData,
	redisUpdateUserTripData,
	redisGetTripExperiences,
	redisUpdateTripExperiences,
} from './trip.service';

export const createSocket = (server: http.Server): SocketServer => {
	const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>(server, {
		cors: {
			methods: ['GET', 'POST'],
			origin: ['http://localhost:5173'],
			credentials: true,
		},
	});

	return io;
};

export const socketInit = (io: SocketServer): void => {
	io.on('connection', (socket: SocketType) => {
		Logger.info(`A user connected with id: ${socket.id}`);

		socketEventValidator(socket);

		socketDataValidator(socket, 'joinTrip', socketDataSchema.joinTrip);
		socket.on('joinTrip', (tripId) => {
			socket.join(tripId);
			socket.to(tripId).emit('tripJoined', socket.id);

			Logger.info(`User ${socket.id} joined trip room: ${tripId}`);
		});

		socketDataValidator(socket, 'updateLocation', socketDataSchema.updateLocation);
		socket.on('updateLocation', (tripId, location) => {
			socket.to(tripId).emit('locationUpdated', socket.id, location);
		});

		// socketDataValidator(socket, 'finishExperience', socketDataSchema.finishExperience);
		socket.on('finishExperience', async (tripId, userId, index, score) => {
			try {
				Logger.info(`User ${userId} finished experience #${index} with score ${score}`);

				const userData = await redisGetUserTripData(tripId, userId);
				if (userData.finishedExperiences[index]) {
					throw new AppError('BadRequest', 'Experience already finished', 400, 'Redis');
				}

				const updatedData = await redisUpdateUserTripData(tripId, userId, {
					score: Object.assign([...userData.score], { [index]: score }),
					finishedExperiences: Object.assign([...userData.finishedExperiences], { [index]: true }),
				});

				const tripExperiences = await redisGetTripExperiences(tripId);
				const currentExperience = tripExperiences[index];

				const emptySpotIndex = currentExperience.winners.findIndex((winner) => winner === null);
				if (emptySpotIndex !== -1) {
					currentExperience.winners[emptySpotIndex] = userId;
					await redisUpdateTripExperiences(tripId, index, currentExperience);
				}
				io.to(tripId).emit('experienceFinished', updatedData, userId, index);
			} catch (error) {
				Logger.error(error);
			}
		});

		socketDataValidator(socket, 'sendMessage', socketDataSchema.sendMessage);
		socket.on('sendMessage', (tripId, message, userId) => {
			console.log(tripId, message);
			socket.to(tripId).emit('messageSent', message, userId);
		});

		socket.on('disconnect', () => {
			Logger.info(`A user disconnected with id: ${socket.id}`);
		});

		socket.on('error', (error: Error) => {
			const { message } = error;

			if (error instanceof ValidationError) {
				const { errorDetails } = error;
				socket.emit('error', { errorDetails, message });
			} else {
				socket.emit('error', message);
			}

			Logger.error(error);
		});

		socket.on('connect-error', (error: ExtendedError) => {
			socket.emit('error', error.message);
			Logger.error(error);
		});
	});
};
