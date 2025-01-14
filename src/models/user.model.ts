import mongoose, { Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name?: string;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: { type: String, required: false },
    imageUrl: { type: String, required: false },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUser>('User', userSchema);
