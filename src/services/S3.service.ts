import { Upload } from '@aws-sdk/lib-storage';
import {
	CompleteMultipartUploadCommandOutput,
	DeleteObjectCommandOutput,
	GetObjectCommandOutput,
	PutObjectCommandInput,
	S3,
} from '@aws-sdk/client-s3';
import fs from 'fs';
import { AWS_ACCESS_KEY, AWS_BUCKET_NAME, AWS_REGION, AWS_SECRET_KEY } from '../env.config';

class S3Service {
	private s3: S3;
	private readonly bucketName: string;

	constructor() {
		this.s3 = new S3({
			region: AWS_REGION,

			credentials: {
				accessKeyId: AWS_ACCESS_KEY,
				secretAccessKey: AWS_SECRET_KEY,
			},
		});
		this.bucketName = AWS_BUCKET_NAME;
	}

	async uploadFile(
		filePath: string,
		fileName: string,
		fileType: string
	): Promise<CompleteMultipartUploadCommandOutput> {
		const fileContent = fs.readFileSync(filePath);
		const params: PutObjectCommandInput = {
			Bucket: this.bucketName,
			Key: fileName,
			Body: fileContent,
			ContentType: fileType,
		};

		return await new Upload({
			client: this.s3,
			params,
		}).done();
	}

	async deleteFile(fileName: string): Promise<DeleteObjectCommandOutput> {
		return await this.s3.deleteObject({
			Bucket: this.bucketName,
			Key: fileName,
		});
	}

	async renameFile(oldFileName: string, newFileName: string): Promise<void> {
		const copyParams = {
			Bucket: this.bucketName,
			CopySource: `${this.bucketName}/${oldFileName}`,
			Key: newFileName,
		};
		await this.s3.copyObject(copyParams);

		const deleteParams = {
			Bucket: this.bucketName,
			Key: oldFileName,
		};
		await this.s3.deleteObject(deleteParams);
	}

	async getFile(fileName: string): Promise<GetObjectCommandOutput> {
		return await this.s3.getObject({
			Bucket: this.bucketName,
			Key: fileName,
		});
	}
}

export const s3Service = new S3Service();
