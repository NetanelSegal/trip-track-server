import mongoose from 'mongoose';
import { Logger } from '../utils/Logger';

(async () => {
  try {
    Logger.info('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URL);
    Logger.info('Connected to MongoDB');
  } catch (error) {
    Logger.error('Failed to connect to MongoDB');
  }
})();
