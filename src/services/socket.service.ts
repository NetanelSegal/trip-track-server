import { ExtendedError, Server } from "socket.io";
import { Logger } from "../utils/Logger";
import http from "http";
import { ValidationError } from "../utils/AppError";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
  SocketServer,
  SocketType,
} from "../types/socket";
import { socketEventValidator } from "../middlewares/socketEventValidator";
import { socketDataValidator } from "../middlewares/socketDataValidator";
import { socketDataSchema } from "../validationSchemas/socketSchemas";

export const createSocket = (server: http.Server): SocketServer => {
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(server, {
    cors: {
      methods: ["GET", "POST"],
      origin: ["http://localhost:5173"],
      credentials: true,
    },
  });

  return io;
};

export const socketInit = (io: SocketServer): void => {
  io.on("connection", (socket: SocketType) => {
    Logger.info(`A user connected with id: ${socket.id}`);

    socketEventValidator(socket);

    // TODO: replace with relevant schema (package?)
    socketDataValidator(socket, "joinTrip", socketDataSchema.joinTrip);
    socket.on("joinTrip", (tripId) => {
      // TODO:Attach data validator middleware
      //  on every event if needed
      // TODO: set up schemas in package if needed

      socket.join(tripId);
      socket.to(tripId).emit("tripJoined", socket.id);

      Logger.info(`User ${socket.id} joined trip room: ${tripId}`);
    });

    // TODO: replace with relevant schema (package?)
    socketDataValidator(
      socket,
      "updateLocation",
      socketDataSchema.updateLocation
    );
    socket.on("updateLocation", (tripId, location) => {
      socket.to(tripId).emit("locationUpdated", socket.id, location);
    });

    socketDataValidator(
      socket,
      "finishExperience",
      socketDataSchema.finishExperience
    );
    socket.on("finishExperience", (tripId) => {
      socket.to(tripId).emit("experienceFinished", socket.id);
    });

    socketDataValidator(socket, "sendMessage", socketDataSchema.sendMessage);
    socket.on("sendMessage", (tripId, message) => {
      console.log(tripId, message);

      io.to(tripId).emit("messageSent", message);
    });

    socket.on("disconnect", () => {
      Logger.info(`A user disconnected with id: ${socket.id}`);
    });

    socket.on("error", (error: Error) => {
      const { message } = error;

      if (error instanceof ValidationError) {
        const { errorDetails } = error;
        socket.emit("error", { errorDetails, message });
      } else {
        socket.emit("error", message);
      }

      Logger.error(error);
    });

    socket.on("connect-error", (error: ExtendedError) => {
      socket.emit("error", error.message);
      Logger.error(error);
    });
  });
};
