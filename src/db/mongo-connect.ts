import mongoose from 'mongoose';
import { Logger } from '../utils/Logger';
import { AppError } from '../utils/AppError';

(async () => {
  try {
    Logger.info('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URL);
    Logger.info('Connected to MongoDB');
  } catch (error) {
    Logger.error(new AppError(error.message, 500, 'MongoDB'));
  }
})();
