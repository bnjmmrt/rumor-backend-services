// import multer from "multer";
// import { multerS3 } from "multer-s3";
import {
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  PutObjectCommandOutput,
  DeleteObjectCommandOutput,
  HeadObjectCommandOutput,
  GetObjectCommandOutput,
} from '@aws-sdk/client-s3';

import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from '../../config';
import { AWSError } from 'rumor-utils/errors';

// // Multer-S3 Configuration for Direct Upload
// export const upload = multer({
//   storage: multerS3({
//     s3: s3Client,
//     bucket: config.get("BUCKET_DOCUMENTS_NAME"),
//     //contentType: '', // Auto-detect file MIME type
//     metadata: (req, file, cb) => {
//       cb(null, { fieldName: file.fieldname });
//     },
//     key: (req, file, cb) => {
//       const fileName =  `${Date.now()}-${file.originalname}`;
//       cb(null, fileName);
//     },
//   }),
//   limits: { fileSize: 1 * 1024 * 1024 }, // Limit file size to 10MB
// });

interface FilePayload {
  file: Buffer;
  type: string;
  filename: string;
  size: number;
  contentType: string;
  fileKeyId: string;
}

interface FileDataResponse {
  type: string;
  pathFileUrl: string;
  fileKeyId: string;
  filename: string;
  size: string;
  contentType: string;
}

export const humanFileSize = (size: number): string => {
  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  let i = 0;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(2)} ${units[i]}`;
};

class S3ServiceHandler {
  private handleError(error: unknown) {
    throw new AWSError(`${error}`);
  }

  public async uploadFile(payload: FilePayload): Promise<PutObjectCommandOutput> {
    const bucketName = config.get('BUCKET_DOCUMENTS_NAME');

    const s3Client = new S3Client({
      region: config.get('AWS_REGION'),
      credentials: {
        accessKeyId: config.get('AWS_ACCESS_KEY'),
        secretAccessKey: config.get('AWS_SECRET_KEY'),
      },
    });

    const { file, type, filename, size, contentType, fileKeyId } = payload;
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKeyId,
      Body: file,
      ContentType: contentType,
      Metadata: {
        type,
        filename: filename ? filename.replace(/[^a-zA-Z0-9 .]/g, '') : fileKeyId,
        size: humanFileSize(size),
        contentType,
      },
    });

    try {
      return await s3Client.send(command);
    } catch (error) {
      this.handleError(error);
    }
  }

  public async removeFile(fileKeyId: string): Promise<DeleteObjectCommandOutput> {
    const bucketName = config.get('BUCKET_DOCUMENTS_NAME');

    const s3Client = new S3Client({
      region: config.get('AWS_REGION'),
      credentials: {
        accessKeyId: config.get('AWS_ACCESS_KEY'),
        secretAccessKey: config.get('AWS_SECRET_KEY'),
      },
    });

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: fileKeyId,
    });

    try {
      return await s3Client.send(command);
    } catch (error) {
      this.handleError(error);
    }
  }

  public async getFile(fileKeyId: string): Promise<HeadObjectCommandOutput> {
    const bucketName = config.get('BUCKET_DOCUMENTS_NAME');

    const s3Client = new S3Client({
      region: config.get('AWS_REGION'),
      credentials: {
        accessKeyId: config.get('AWS_ACCESS_KEY'),
        secretAccessKey: config.get('AWS_SECRET_KEY'),
      },
    });

    const command = new HeadObjectCommand({
      Bucket: bucketName,
      Key: fileKeyId,
    });

    try {
      return await s3Client.send(command);
    } catch (error) {
      this.handleError(error);
    }
  }

  public async getFileStream(fileKeyId: string): Promise<GetObjectCommandOutput> {
    const bucketName = config.get('BUCKET_DOCUMENTS_NAME');

    const s3Client = new S3Client({
      region: config.get('AWS_REGION'),
      credentials: {
        accessKeyId: config.get('AWS_ACCESS_KEY'),
        secretAccessKey: config.get('AWS_SECRET_KEY'),
      },
    });

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileKeyId,
    });

    try {
      return await s3Client.send(command);
    } catch (error) {
      this.handleError(error);
    }
  }

  public async updateFile(payload: FilePayload): Promise<PutObjectCommandOutput> {
    const bucketName = config.get('BUCKET_DOCUMENTS_NAME');

    const s3Client = new S3Client({
      region: config.get('AWS_REGION'),
      credentials: {
        accessKeyId: config.get('AWS_ACCESS_KEY'),
        secretAccessKey: config.get('AWS_SECRET_KEY'),
      },
    });

    const { file, type, filename, size, contentType, fileKeyId } = payload;
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKeyId,
      Body: file,
      ContentType: contentType,
      Metadata: {
        type,
        filename: filename.replace(/[^a-zA-Z0-9 .]/g, ''),
        size: humanFileSize(size),
        contentType,
      },
    });

    try {
      return await s3Client.send(command);
    } catch (error) {
      this.handleError(error);
    }
  }

  public async getFileUrl(fileKey: string, expiresIn: number = 3600): Promise<string> {
    const bucketName = config.get('BUCKET_DOCUMENTS_NAME');

    const s3Client = new S3Client({
      region: config.get('AWS_REGION'),
      credentials: {
        accessKeyId: config.get('AWS_ACCESS_KEY'),
        secretAccessKey: config.get('AWS_SECRET_KEY'),
      },
    });

    const getObjectParams = { Bucket: bucketName, Key: fileKey };
    const getObjectCommand = new GetObjectCommand(getObjectParams);
    const urlOptions = { expiresIn };

    try {
      return await getSignedUrl(s3Client, getObjectCommand, urlOptions);
    } catch (error) {
      this.handleError(error);
    }
  }

  public async UploadFileUrl(
    fileKey: string,
    contentType: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    const bucketName = config.get('BUCKET_DOCUMENTS_NAME');

    const s3Client = new S3Client({
      region: config.get('AWS_REGION'),
      credentials: {
        accessKeyId: config.get('AWS_ACCESS_KEY'),
        secretAccessKey: config.get('AWS_SECRET_KEY'),
      },
    });

    const putObjectParams = { Bucket: bucketName, ContentType: contentType, Key: fileKey };
    const putObjectCommand = new PutObjectCommand(putObjectParams);
    const urlOptions = { expiresIn };

    try {
      return await getSignedUrl(s3Client, putObjectCommand, urlOptions);
    } catch (error) {
      this.handleError(error);
    }
  }
}

const S3Service = new S3ServiceHandler();
export default S3Service;
