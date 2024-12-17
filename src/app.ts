import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import './db/mongo-connect';
import { indexRouter } from './routes/index.route';
import { Logger } from './utils/Logger';

const app = express();

app.use(cookieParser());
app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(indexRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  Logger.success(`server is up on: http://localhost:${PORT}`);
});
