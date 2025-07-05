import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import './db/mongo-connect';
import { indexRouter } from './routes/index.route';
import { Logger } from './utils/Logger';
import { createSocket, socketInit } from './services/socket.service';
import { FRONT_END_MAIN_URL } from './env.config';

const PORT = process.env.PORT || 3000;

const app = express();

// middlewares
app.use(cookieParser());
app.use(
	cors({
		origin: FRONT_END_MAIN_URL,
		credentials: true,
	})
);
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// routes
app.use(indexRouter);

const server = app.listen(PORT, () => {
	Logger.success(`server is up on: http://localhost:${PORT}`);
});

// socket
const io = createSocket(server);
socketInit(io);
