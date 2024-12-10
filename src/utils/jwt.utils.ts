import jwt, { JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET } from '../env.config';
import { Payload } from '../types';

const JWT_EXPIRATION = '1h';

export const generateToken = (payload: Payload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
};

export const verifyToken = (token: string): Payload | null => {
  const { exp, iat, ...payload } = jwt.verify(token, JWT_SECRET) as JwtPayload &
    Payload;

  return payload;
};
