import { Request } from 'express';

export interface Payload {
  _id: string;
  email: string;
}

export interface CustomRequest extends Request {
  user: Payload;
}
