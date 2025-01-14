import { NextFunction, Request, Response } from 'express';
import { getUserById, updateUser } from '../services/user.service';
import { RequestJWTPayload } from '../types';

export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const user = await getUserById(userId);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as RequestJWTPayload).user._id;
    const updateData = req.body;

    const updatedUser = await updateUser(userId, updateData);
    if (!updatedUser) {
      res
        .status(404)
        .json({ message: 'User not found or could not be updated' });
      return;
    }
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};
