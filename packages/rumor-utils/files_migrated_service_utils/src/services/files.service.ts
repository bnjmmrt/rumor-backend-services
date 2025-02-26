// import { HttpStatus, Injectable, Logger } from '@nestjs/common';
// import { responses } from '../commons/responses';
// import { FileResponse, RemoveFileResponse } from '../grpc/files/files.pb';
// import { RequestByIdDto, UpdateFileDto, UploadFileDto } from '../dtos';
// import { generateUniqueFileName } from '../commons/helpers';
// import { S3Service } from '@rumor/shared/aws/s3.service';

// @Injectable()
// export class FilesService {
//   private readonly logger = new Logger(FilesService.name);

//   constructor(private readonly s3Service: S3Service) {}

//   private async handleFileResponse(fileKeyId: string): Promise<FileResponse> {
//     const fileMetadata = await this.s3Service.getFile(fileKeyId);

//     if (!fileMetadata.Metadata) {
//       throw new Error('Metadata not found');
//     }

//     const dataFile = {
//       type: fileMetadata.Metadata.type,
//       pathFileUrl: await this.s3Service.getFileUrl(fileKeyId),
//       fileKeyId,
//       filename: fileMetadata.Metadata.filename,
//       size: fileMetadata.Metadata.size,
//       contentType: fileMetadata.ContentType,
//     };

//     return responses.data(dataFile);
//   }

//   public async uploadFile(payload: UploadFileDto): Promise<FileResponse> {
//     const fileKeyId = generateUniqueFileName(payload.type);

//     try {
//       const result = await this.s3Service.uploadFile({ ...payload, fileKeyId });

//       if (result.$metadata.httpStatusCode !== HttpStatus.OK) {
//         throw new Error('File upload failed with status code ' + result.$metadata.httpStatusCode);
//       }

//       return await this.handleFileResponse(fileKeyId);
//     } catch (error) {
//       this.logger.error(`Error saving file: ${error}`);
//       return responses.badRequest('Error saving file');
//     }
//   }

//   public async removeFile(payload: RequestByIdDto): Promise<RemoveFileResponse> {
//     try {
//       await this.s3Service.getFile(payload.id); // Ensure file exists before deletion
//       await this.s3Service.removeFile(payload.id);
//       return responses.data({ message: 'File deleted' });
//     } catch (error) {
//       this.logger.error(`Error deleting file: ${error}`);
//       return responses.badRequest('Error deleting file');
//     }
//   }

//   public async getFile(payload: RequestByIdDto): Promise<FileResponse> {
//     try {
//       const fileMetadata = await this.s3Service.getFile(payload.id);

//       if (fileMetadata.$metadata.httpStatusCode !== HttpStatus.OK) {
//         return responses.notFound('File not found');
//       }

//       return await this.handleFileResponse(payload.id);
//     } catch (error) {
//       this.logger.error(`Error getting file: ${error}`);
//       return responses.badRequest('Error getting file');
//     }
//   }

//   public async updateFile(payload: UpdateFileDto): Promise<FileResponse> {
//     try {
//       await this.s3Service.getFile(payload.fileKeyId); // Ensure file exists before updating

//       const result = await this.s3Service.updateFile(payload);

//       if (result.$metadata.httpStatusCode !== HttpStatus.OK) {
//         throw new Error('File update failed with status code ' + result.$metadata.httpStatusCode);
//       }

//       return await this.handleFileResponse(payload.fileKeyId);
//     } catch (error) {
//       this.logger.error(`Error updating file: ${error}`);
//       return responses.badRequest('Error updating file');
//     }
//   }
// }
