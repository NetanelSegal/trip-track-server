import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../env.config';
import { Payload } from '../types';

const JWT_EXPIRATION = '1h';

export const generateToken = (payload: Payload): string => {
  console.log(payload);
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
};

export const verifyToken = (token: string): Payload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as Payload;
  } catch (error) {
    return null;
  }
};
