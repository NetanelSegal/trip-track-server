import { Router } from 'express';
import uploadMiddleware from '../middlewares/multerConfig';
import { deleteImage, uploadImage } from '../controllers/upload.controller';
import { validateRequest } from '../middlewares/validatorRequest';
import { deleteImageSchema } from '../validationSchemas/uploadSchemas';

const router = Router();

router.post('/image', uploadMiddleware.single('file'), uploadImage);
router.delete(
  '/image',
  validateRequest(deleteImageSchema, 'query'),
  deleteImage
);

export { router as uploadRouter };
