import AWS from 'aws-sdk';
import fs from 'fs';
import { AWS_BUCKET_NAME, AWS_REGION } from "../env.config";

class S3Service {
    private s3: AWS.S3;
    private readonly bucketName: string;

    // todo - add to env AWS_BUCKET_NAME, AWS_REGION
    constructor() {
        // accessKeyId, secretAccessKey - by default from the aws sdk once logged in
        this.s3 = new AWS.S3({
            region: AWS_REGION,
        });
        this.bucketName = AWS_BUCKET_NAME;
    }

    // you can change it from string to blob or to File itself
    async uploadFile(filePath: string, fileName: string): Promise<void> {
        const fileContent = fs.readFileSync(filePath);
        const params = {
            Bucket: this.bucketName,
            Key: fileName,
            Body: fileContent,
        };
        await this.s3.upload(params).promise();
    }

    async deleteFile(fileName: string): Promise<void> {
        const params = {
            Bucket: this.bucketName,
            Key: fileName,
        };
        await this.s3.deleteObject(params).promise();
    }

    async renameFile(oldFileName: string, newFileName: string): Promise<void> {
        const copyParams = {
            Bucket: this.bucketName,
            CopySource: `${this.bucketName}/${oldFileName}`,
            Key: newFileName,
        };
        await this.s3.copyObject(copyParams).promise();

        const deleteParams = {
            Bucket: this.bucketName,
            Key: oldFileName,
        };
        await this.s3.deleteObject(deleteParams).promise();
    }
}

export const s3Service = new S3Service();
