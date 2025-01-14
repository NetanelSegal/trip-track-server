import { Router, Request, Response, NextFunction } from 'express';
import uploadMiddleware from '../middlewares/multerConfig';
import { ENV } from '../env.config';
import { s3Service } from '../services/S3.service';
import fs from 'fs';

const router = Router();

router.post(
  '/',
  uploadMiddleware.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file = req.file;
      if (!file) throw new Error('sss');

      let s3Response = null;
      if (ENV === 'production') {
        s3Response = await s3Service.uploadFile(
          file.path,
          file.filename,
          file.mimetype
        );
        fs.unlinkSync(file.path);
      }
      res.status(200).json({
        message: 'File has been uploaded successfully',
        ...(s3Response ? { url: s3Response.Location } : {}),
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as uploadRouter };
