import AWS from 'aws-sdk';
import fs from 'fs';
import {
  AWS_ACCESS_KEY,
  AWS_BUCKET_NAME,
  AWS_REGION,
  AWS_SECRET_KEY,
} from '../env.config';

class S3Service {
  private s3: AWS.S3;
  private readonly bucketName: string;

  constructor() {
    this.s3 = new AWS.S3({
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
  ): Promise<AWS.S3.ManagedUpload.SendData> {
    const fileContent = fs.readFileSync(filePath);
    const params: AWS.S3.PutObjectRequest = {
      Bucket: this.bucketName,
      Key: fileName,
      Body: fileContent,
      ContentType: fileType,
    };

    return await this.s3.upload(params).promise();
  }

  async deleteFile(fileName: string): Promise<AWS.S3.DeleteObjectOutput> {
    return await this.s3
      .deleteObject({ Bucket: this.bucketName, Key: fileName })
      .promise();
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
