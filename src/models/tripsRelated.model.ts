import mongoose from 'mongoose';

export type TTripsRelatedSchema = {
	userId: string;
	tripsId: string[];
};

const tripsRelatedSchema = new mongoose.Schema<TTripsRelatedSchema>({
	userId: { type: String, required: true },
	tripsId: [{ type: String, required: true }],
});

export const TripsRelatedModel = mongoose.model<TTripsRelatedSchema>('TripsRelated', tripsRelatedSchema);
