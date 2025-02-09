import { ClientToServerEvents, SocketType } from '../types/socket';
import { AppError } from '../utils/AppError';

const validClientEvents: (keyof ClientToServerEvents)[] = [
  'joinTrip',
  'updateLocation',
  'finishExperience',
  'sendMessage',
  'connect-error',
];

export const socketEventValidator = (socket: SocketType) => {
  socket.use(([event], next) => {
    if (!validClientEvents.includes(event as keyof ClientToServerEvents)) {
      const errorMessage = `Invalid event: ${event} received.`;
      const err = new AppError(
        'InvalidEventInput',
        errorMessage,
        400,
        'Socket'
      );
      next(err);
      return;
    }

    next();
  });
};
