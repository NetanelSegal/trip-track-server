import express from 'express';
import path from 'path';
import cors from 'cors';
import './db/mongo-connect';
import { indexRouter } from './routes/index.route';
import { Logger } from './utils/Logger';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(indexRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  Logger.success(`server is up on: http://localhost:${PORT}`);
});
