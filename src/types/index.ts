import { Request } from 'express';

interface BasePayload {
	_id: string;
	role: 'user' | 'guest' | 'developer';
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

interface DeveloperPayload extends BasePayload {
	role: 'developer';
	email: string;
}

export type Payload = UserPayload | GuestPayload | DeveloperPayload;

export interface RequestJWTPayload extends Request {
	user: Payload;
}
