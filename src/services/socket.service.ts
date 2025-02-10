import { ExtendedError, Server } from 'socket.io';
import { Logger } from '../utils/Logger';
import http from 'http';
import { ValidationError } from '../utils/AppError';
import {
	ClientToServerEvents,
	InterServerEvents,
	ServerToClientEvents,
	SocketData,
	SocketServer,
	SocketType,
} from '../types/socket';
import { socketEventValidator } from '../middlewares/socketEventValidator';
import { socketDataValidator } from '../middlewares/socketDataValidator';
import { z } from 'zod';

export const createSocket = (server: http.Server): SocketServer => {
	const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, {
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

		// TODO: replace with relevant schema (package?)
		socketDataValidator(
			socket,
			'joinTrip',
			z.string({
				message: 'tripId must be a string',
			})
		);
		socket.on('joinTrip', (tripId) => {
			// TODO:Attach data validator middleware
			//  on every event if needed
			// TODO: set up schemas in package if needed

			socket.join(tripId);
			socket.to(tripId).emit('tripJoined', socket.id);

			Logger.info(`User ${socket.id} joined trip room: ${tripId}`);
		});

		// TODO: replace with relevant schema (package?)
		socketDataValidator(socket, 'updateLocation', [
			z.string({
				message: 'tripId must be a string',
			}),
			z.object({
				lon: z.number({
					message: 'Longitude must be a number',
				}),
				lat: z.number({
					message: 'Latitude must be a number',
				}),
			}),
		]);
		socket.on('updateLocation', (tripId, location) => {
			socket.to(tripId).emit('locationUpdated', socket.id, location);
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
