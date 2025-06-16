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
	redisGetTripCurrentExpIndex,
	redisSetUserInTripExpRange,
	redisGetUsersInTripExperinceRange,
	redisIncrementTripCurrentExpIndex,
	redisInitUsersInTripExpRange,
	redisRemoveUserFromSets,
	redisAddUserToTrip,
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
		const { userId, tripId } = socket.handshake.query;
		socket.data.userId = userId;
		socket.data.tripId = tripId;
		Logger.info(`A user connected with id: ${socket.id}`);

		socketEventValidator(socket);

		socketDataValidator(socket, 'joinTrip', socketDataSchema.joinTrip);
		socket.on('joinTrip', async (tripId, userId) => {
			socket.join(tripId);
			const user = await redisGetUserTripData(tripId, userId);
			await redisAddUserToTrip(tripId, { userId, name: user.name, imageUrl: user.imageUrl });
			io.to(tripId).emit('tripJoined', { userId, ...user });
			Logger.info(`User ${socket.id} joined trip room: ${tripId}`);
		});

		socketDataValidator(socket, 'updateLocation', socketDataSchema.updateLocation);
		socket.on('updateLocation', (tripId, location) => {
			const { userId } = socket.data;
			socket.to(tripId).emit('locationUpdated', userId, location);
		});

		socket.on('currentUserOutOfTripRoute', (tripId, userId) => {
			io.to(tripId).emit('userIsOutOfTripRoute', userId);
		});

		socketDataValidator(socket, 'userInExperience', socketDataSchema.userInExperience);
		socket.on('userInExperience', async (tripId, userId, index) => {
			if (index !== (await redisGetTripCurrentExpIndex(tripId))) return;

			await redisSetUserInTripExpRange(tripId, userId, { isExist: true, isFinished: false });

			const usersInTripExpRange = await redisGetUsersInTripExperinceRange(tripId);
			const allUsersInExperience = usersInTripExpRange.every((user) => user.data.isExist === true);
			if (allUsersInExperience) {
				io.to(tripId).emit('allUsersInExperience', true);
			}
		});

		socketDataValidator(socket, 'finishExperience', socketDataSchema.finishExperience);
		socket.on('finishExperience', async (tripId, userId, index, score) => {
			try {
				Logger.info(`User ${userId} finished experience #${index} with score ${score}`);

				const userData = await redisGetUserTripData(tripId, userId);
				if (userData.finishedExperiences[index]) {
					throw new AppError('BadRequest', 'Experience already finished', 400, 'Redis');
				}

				userData.score[index] = score;
				userData.finishedExperiences[index] = true;
				const updatedData = await redisUpdateUserTripData(tripId, userId, userData);

				const tripExperiences = await redisGetTripExperiences(tripId);
				const currentExperience = tripExperiences[index];

				const emptySpotIndex = currentExperience.winners.findIndex((winner) => winner === null);
				if (emptySpotIndex !== -1) {
					currentExperience.winners[emptySpotIndex] = userId;
					await redisUpdateTripExperiences(tripId, index, currentExperience);
				}
				await redisSetUserInTripExpRange(tripId, userId, { isExist: true, isFinished: true });

				io.to(tripId).emit('experienceFinished', updatedData, userId, index);

				const usersInTripExpRange = await redisGetUsersInTripExperinceRange(tripId);
				const allUsersFinished = usersInTripExpRange.every((user) => user.data.isFinished === true);
				if (allUsersFinished) {
					await redisInitUsersInTripExpRange(tripId);
					const nextExpIndex = await redisIncrementTripCurrentExpIndex(tripId);
					io.to(tripId).emit('allUsersFinishedCurrentExp', nextExpIndex);
				}
			} catch (error) {
				Logger.error(error);
			}
		});

		socketDataValidator(socket, 'sendMessage', socketDataSchema.sendMessage);
		socket.on('sendMessage', (tripId, message, userId) => {
			console.log(tripId, message);
			io.to(tripId).emit('messageSent', message, userId);
		});

		socketDataValidator(socket, 'tripFinished', socketDataSchema.tripFinished);
		socket.on('tripFinished', (tripId) => {
			io.to(tripId).emit('finishedTrip', tripId);
		});

		socket.on('disconnect', async () => {
			try {
				const { tripId, userId } = socket.data;
				Logger.info(`A user disconnected with id: ${userId} from trip room: ${tripId}`);
				await redisRemoveUserFromSets(tripId, userId);
				io.to(tripId).emit('userDisconnected', userId);
			} catch (error) {
				Logger.error(error);
			}
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
