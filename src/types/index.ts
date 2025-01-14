import { Request } from 'express';

export interface Payload {
  _id: string;
  email: string;
}

export interface RequestJWTPayload extends Request {
  user: Payload;
}
