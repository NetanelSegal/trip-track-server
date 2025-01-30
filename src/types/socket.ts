import { Server, Socket } from 'socket.io';

interface ServerToClientEvents {
  tripJoined: (userSocketId: string) => void;
  locationUpdated: (
    userId: string,
    location: { lat: number; lon: number }
  ) => void;
  tripStatusChanged: (tripId: string, status: string) => void;
  error: (
    data: { errorDetails: Record<string, any>; message: string } | string
  ) => void;
}

interface ClientToServerEvents {
  joinTrip: (tripId: string) => void;
  updateLocation: (
    tripId: string,
    { lon, lat }: { lon: number; lat: number }
  ) => void;
  'connect-error': (error: Error) => void;
}

interface InterServerEvents {
  error: (error: Error) => void;
  disconnect: () => void;
  connect: () => void;
}

interface SocketData {}

type SocketServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

type SocketType = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export {
  SocketServer,
  SocketType,
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
};
