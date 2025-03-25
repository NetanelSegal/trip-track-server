import { Types } from 'trip-track-package';

export type Trip = Omit<Types['Trip']['Model'], 'reward' | 'participants'> & {
	participants: { userId: string; score: number }[];
	reward?: {
		title: string;
		image?: string;
	};
};
