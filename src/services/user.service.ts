import { UserModel } from '../models/user.model';
import { AppError } from '../utils/AppError';

export const userGetOrCreate = async ({
  email,
  name,
}: {
  email: string;
  name: string;
}) => {
  try {
    const user = await UserModel.findOne({ email });
    if (user) {
      return user;
    }
    return await UserModel.create({ email, name });
  } catch (error) {
    throw new AppError(error.name, error.message, 500, 'MongoDB');
  }
};
