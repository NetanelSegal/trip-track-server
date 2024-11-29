import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import './db/mongo-connect';
import { Logger } from './utils/Logger';
import { UserModel } from './models/user.model';
import { AppError } from './utils/AppError';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use((req: Request, res: Response, next: NextFunction) => {
  Logger.info(`${req.method}:${req.originalUrl}`);
  next();
});

app.get('/health', async (req: Request, res: Response) => {
  res.send('OK');
});

app.use((err: AppError, req: Request, res: Response, _next: NextFunction) => {
  Logger.error(err);
  res.status(500).json({ message: err.message, title: err.name });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`server is up on: http://localhost:${PORT}`);
});
