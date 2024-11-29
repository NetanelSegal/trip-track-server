import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import './db/mongo-connect';
import { Logger } from './utils/Logger';
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use((req: Request, res: Response, next: NextFunction) => {
  Logger.info(`${req.method}:${req.originalUrl}`);
  next();
});

app.get('/health', async (req, res) => {
  res.send('OK');
});

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  Logger.error(
    `${req.method}:${req.originalUrl}, failed with [${err.name}]:${err.message}`
  );
  res.status(500).json({ message: err.message, title: err.name });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`server is up on: http://localhost:${PORT}`);
});
