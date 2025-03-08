import { Server, Socket } from 'socket.io';

type LocationPayload = {
	lon: number;
	lat: number;
};

type ClientEventPayloads = {
	joinTrip: [tripId: string];
	updateLocation: [tripId: string, location: LocationPayload];
	finishExperience: [tripId: string];
	sendMessage: [tripId: string, message: string, userId: string];
	'connect-error': [error: Error];
};

type ServerEventPayloads = {
	tripJoined: [userSocketId: string];
	locationUpdated: [userSocketId: string, location: LocationPayload];
	experienceFinished: [userSocketId: string];
	messageSent: [message: string, userId: string];
	tripStatusChanged: [tripId: string, status: string];
	error: [data: string | { message: string; errorDetails: Record<string, any> }];
};

export const ServerEvents = {
	tripJoined: 'tripJoined',
	locationUpdated: 'locationUpdated',
	experienceFinished: 'experienceFinished',
	messageSent: 'messageSent',
	tripStatusChanged: 'tripStatusChanged',
	error: 'error',
};

export const ClientEvents = {
	joinTrip: 'joinTrip',
	updateLocation: 'updateLocation',
	finishExperience: 'finishExperience',
	sendMessage: 'sendMessage',
	connectError: 'connect-error',
} as const;

type ClientToServerEvents = {
	[K in keyof ClientEventPayloads]: (...args: ClientEventPayloads[K]) => void;
};

type ServerToClientEvents = {
	[K in keyof ServerEventPayloads]: (...args: ServerEventPayloads[K]) => void;
};

interface InterServerEvents {
	error: (error: Error) => void;
	disconnect: () => void;
	connect: () => void;
}

type SocketServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>;

type SocketType = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents>;

export { SocketServer, SocketType, ClientToServerEvents, InterServerEvents, ServerToClientEvents };
