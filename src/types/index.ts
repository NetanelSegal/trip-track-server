import { Request } from 'express';
import { Types } from 'mongoose';

export interface Payload {
  _id: Types.ObjectId;
}
export interface CustomRequest extends Request {
  user: Payload;
}
