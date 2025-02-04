import { Request } from 'express';

export interface Payload {
  _id: string;
  email: string;
}

export interface GuestPayload {
  _id: string;
  role: string;
}

export interface RequestJWTPayload extends Request {
  user: Payload | GuestPayload;
}
