import { Router, Request, Response, NextFunction } from "express";
import uploadMiddleware from "../middlewares/multerConfig";
import { NODE_ENV } from "../env.config";
import { s3Service } from "../services/S3Service.service";
import fs from 'fs';

const router = Router();

router.post('/upload', uploadMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        // TODO - add to declare file 
        const file = (req as any).file as { path: string; filename: string };
        if (!file) {
            // TODO - change to your error handling
            throw new Error("sss")
        }
        if (NODE_ENV === 'production') {
            // handle s3 upload
            await s3Service.uploadFile(file.path, file.filename);
            fs.unlinkSync(file.path); // remove file from the server
        }

        res.status(200).json({ message: "File has been uploaded successfully" });
    } catch (error) {
        /* TODO - add error handling */
        next(error.message)
    }
});

export { router as authRouter };
