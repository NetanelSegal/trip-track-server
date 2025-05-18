import { Request } from 'express';

interface BasePayload {
	_id: string;
	role: 'user' | 'guest';
	name?: string;
	imageUrl?: string;
}

interface UserPayload extends BasePayload {
	role: 'user';
	email: string;
}

interface GuestPayload extends BasePayload {
	role: 'guest';
}

export type Payload = UserPayload | GuestPayload;

export interface RequestJWTPayload extends Request {
	user: Payload;
}
