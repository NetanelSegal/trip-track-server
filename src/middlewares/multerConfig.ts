import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppError } from '../utils/AppError';

const allowedFileTypes = ['image/jpeg', 'image/png'];

const storage = multer.diskStorage({
	destination: (_, __, cb) => {
		const uploadPath = path.resolve(__dirname, '..', 'uploads');
		if (!fs.existsSync(uploadPath)) {
			fs.mkdirSync(uploadPath);
		}
		cb(null, uploadPath);
	},
	filename: (_, file, cb) => {
		const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
		cb(null, `${uniqueSuffix}-${file.originalname}`);
	},
});

const uploadMiddleware = multer({
	storage,
	fileFilter: (_, file, cb) => {
		if (!allowedFileTypes.includes(file.mimetype)) {
			const allowedFileTypesFormatted = allowedFileTypes.map((s) => s.split('/')[1]).join(', ');

			return cb(
				new AppError(
					'MulterValidationError',
					`Invalid file type, the allowed file types are: ${allowedFileTypesFormatted}`,
					400,
					'Multer'
				)
			);
		}

		cb(null, true);
	},
	limits: { fileSize: 5 * 1024 * 1024 },
});

export default uploadMiddleware;
