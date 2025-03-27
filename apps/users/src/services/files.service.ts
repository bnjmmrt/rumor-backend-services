import { FileResponse, RemoveFileResponse } from 'rumor-utils/shared/users/grpc/files/files.pb';
import { RequestByIdDto } from 'rumor-utils/shared/users/dtos/get-file.dto';
import { UploadFileDto } from 'rumor-utils/shared/users/dtos/upload-file.dto';
import { UpdateFileDto } from 'rumor-utils/shared/users/dtos/update-file.dto';
import { generateUniqueFileName } from '../common/helpers';
import S3Service from '../utils/aws/s3';

class FilesService {
  private async handleFileResponse(fileKeyId: string): Promise<any> {
    const fileMetadata = await S3Service.getFile(fileKeyId);

    if (!fileMetadata.Metadata) {
      throw new Error('Metadata not found');
    }

    const dataFile = {
      type: fileMetadata.Metadata.type,
      pathFileUrl: await S3Service.getFileUrl(fileKeyId),
      fileKeyId,
      filename: fileMetadata.Metadata.filename,
      size: fileMetadata.Metadata.size,
      contentType: fileMetadata.ContentType,
    };

    return dataFile;
  }

  public async uploadFile(payload: UploadFileDto): Promise<FileResponse> {
    const fileKeyId = generateUniqueFileName(payload.type);
    await S3Service.uploadFile({ ...payload, fileKeyId });
    return await this.handleFileResponse(fileKeyId);
  }

  public async removeFile(payload: RequestByIdDto): Promise<any> {
    await S3Service.getFile(payload.id);
    await S3Service.removeFile(payload.id);
  }

  public async getFile(payload: RequestByIdDto): Promise<FileResponse> {
    //try {
    const fileMetadata = await S3Service.getFile(payload.id);

    //   if (fileMetadata.$metadata.httpStatusCode !== HttpStatus.OK) {
    //     return responses.notFound('File not found');
    //   }

    return await this.handleFileResponse(payload.id);
    // } catch (error) {
    //   this.logger.error(`Error getting file: ${error}`);
    //   return responses.badRequest('Error getting file');
    // }
  }

  public async updateFile(payload: UpdateFileDto): Promise<FileResponse> {
    await S3Service.getFile(payload.fileKeyId); // Ensure file exists before updating

    const result = await S3Service.updateFile(payload);
    //   if (result.$metadata.httpStatusCode !== HttpStatus.OK) {
    //     throw new Error('File update failed with status code ' + result.$metadata.httpStatusCode);
    //   }
    return await this.handleFileResponse(payload.fileKeyId);
  }
}

const filesService = new FilesService();
export default filesService;
