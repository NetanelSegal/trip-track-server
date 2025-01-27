import fs from 'fs';
import { NextFunction, Request, Response } from 'express';
import { s3Service } from '../services/S3.service';
import { ENV } from '../env.config';
import { AppError } from '../utils/AppError';
import { CompleteMultipartUploadCommandOutput } from '@aws-sdk/client-s3';
export async function uploadImage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const file = req.file;
    if (!file) throw new AppError('File not found', 'File not found', 400);

    let s3Response: CompleteMultipartUploadCommandOutput = null;

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

export async function deleteImage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { filename } = req.query;

    if (ENV === 'production') {
      await s3Service.deleteFile(filename as string);
    }
    res.status(200).json({ message: 'File has been deleted successfully' });
  } catch (error) {
    next(error);
  }
}
