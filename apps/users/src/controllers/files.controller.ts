import { FileResponse } from 'rumor-utils/shared/users/grpc/files/files.pb';
import { RequestByIdDto } from 'rumor-utils/shared/users/dtos/get-file.dto';
import { UploadFileDto } from 'rumor-utils/shared/users/dtos/upload-file.dto';
import { UpdateFileDto } from 'rumor-utils/shared/users/dtos/update-file.dto';
import { GetSignedUploadUrlRequestDto } from 'rumor-utils/shared/users/dtos/get-upload-url-dto';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';

import filesService from '../services/files.service';
import { CreateResponse, GetResponse, UpdateResponse, DeleteResponse } from 'rumor-utils/success';
import { generateUniqueFileName } from '../common/helpers';
import S3Service from '../utils/aws/s3';
import asyncWrapper from '../server/helpers/asyncWrapper';

export class FilesControllerHandler {
  async handleFileResponse(fileKeyId: string): Promise<any> {
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

  //'UploadFile'
  uploadFile = asyncWrapper(async (req, res): Promise<any> => {
    const payload: any = req.file;
    const maxFileSizeMB = config.get('FILE_SIZE_IN_BYTES');
    const fileSizeBytes = Number(payload.size);
    if (fileSizeBytes > maxFileSizeMB) {
      throw new Error('File size exceeds the maximum limit of 5 MB');
    }

    const fileKeyId = generateUniqueFileName(payload.originalname);

    await S3Service.uploadFile({ ...payload, fileKeyId, file: payload.buffer });
    const response = await this.handleFileResponse(fileKeyId);
    const getResponse = new GetResponse(response);
    res.status(getResponse.statusCode).json(getResponse);
  });

  //'RemoveFile'
  removeFile = asyncWrapper(async (req, res): Promise<any> => {
    const payload: RequestByIdDto = req.params;
    await S3Service.getFile(payload.id);
    await S3Service.removeFile(payload.id);
    const deleteResponse = new DeleteResponse({});
    res.status(deleteResponse.statusCode).json(deleteResponse);
  });

  //'GetFile'
  viewFile = asyncWrapper(async (req, res): Promise<any> => {
    const payload: string = req.params[0];

    const fileResponse: any = await S3Service.getFileStream(payload);

    if (!fileResponse.Body) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.setHeader('Content-Type', fileResponse.ContentType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${payload}"`);

    // Pipe the S3 file stream to the response
    fileResponse.Body.pipe(res);
  });

  //'GetFile'
  getFile = asyncWrapper(async (req, res): Promise<any> => {
    const payload: RequestByIdDto = req.body;
    const response = await this.handleFileResponse(payload.id);
    const getResponse = new GetResponse(response);
    res.status(getResponse.statusCode).json(getResponse);
  });

  //'UpdateFile'
  updateFile = asyncWrapper(async (req, res): Promise<any> => {
    const payload: UpdateFileDto = req.file;
    await S3Service.getFile(payload.fileKeyId);
    await S3Service.updateFile(payload);
    const response = await this.handleFileResponse(payload.fileKeyId);
    const getResponse = new GetResponse(response);
    res.status(getResponse.statusCode).json(getResponse);
  });

  getSignedUploadUrl = asyncWrapper(async (req, res): Promise<any> => {
    const payload: GetSignedUploadUrlRequestDto = req.body;
    const { path, extension } = payload;
    let { contentType } = payload;
    const fileName = extension != null ? `${uuidv4()}.${extension}` : uuidv4();
    const uploadUrlPath = `${path}/${fileName}`;
    contentType = contentType || 'text/csv';
    const maxFileSizeMB = config.get('FILE_SIZE_IN_BYTES');
    const fileSizeBytes = Number(payload.size);
    if (fileSizeBytes > maxFileSizeMB) {
      throw new Error('File size exceeds the maximum limit of 5 MB');
    }

    const uri = await S3Service.UploadFileUrl(uploadUrlPath, contentType); // Ensure file exists before updating

    const dataFile = {
      pathFileUrl: uri,
      fileKeyId: uploadUrlPath,
      filename: fileName,
      size: fileSizeBytes.toString(),
      contentType: contentType,
    };

    const getResponse = new GetResponse(dataFile);
    res.status(getResponse.statusCode).json(getResponse);
  });
}

const FilesController = new FilesControllerHandler();
export default FilesController;
