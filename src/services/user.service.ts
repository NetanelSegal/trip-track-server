import { Types } from 'mongoose';
import { UserModel } from '../models/user.model';

export const userGetOrCreateMongo = async ({
  email,
  name,
}: {
  email: string;
  name: string;
}): Promise<{ _id: Types.ObjectId; email: string; name: string }> => {
  let user = await UserModel.findOne({ email });

  if (!user) {
    user = await UserModel.create({ email, name });
  }

  return user;
};
