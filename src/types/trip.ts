import { Types } from 'trip-track-package';

export type Trip = Omit<Types['Trip']['Model'], 'reward'> & {
	reward?: {
		title: string;
		image?: string;
	};
};
