import mongoose from 'mongoose';
import { Logger } from '../utils/Logger';
import { AppError } from '../utils/AppError';
import { MONGO_URL } from '../env.config';

(async () => {
  try {
    Logger.info('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URL);
    Logger.info('Connected to MongoDB');
  } catch (error) {
    Logger.error(new AppError(error.name, error.message, 500, 'MongoDB'));
  }
})();
