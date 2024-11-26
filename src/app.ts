import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(req.method, req.originalUrl);
  next();
});

app.get('/health', async (req, res) => {
  res.send('OK');
});

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(`${req.method}:${req.originalUrl}, failed with error:${err}`);
  res.status(500).json({ message: err.message, title: err.name });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`server is up on: http://localhost:${PORT}`);
});
