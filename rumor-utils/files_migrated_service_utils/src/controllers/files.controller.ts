// import { Controller } from '@nestjs/common';
// import { FilesService } from '../services/files.service';

// import { GrpcMethod } from '@nestjs/microservices';
// import { FileResponse, FILES_SERVICE_NAME } from '../grpc/files/files.pb';
// import { RequestByIdDto, UpdateFileDto, UploadFileDto } from '../dtos';

// @Controller()
// export class FilesController {
//   constructor(private readonly filesService: FilesService) {}

//   @GrpcMethod(FILES_SERVICE_NAME, 'UploadFile')
//   public async uploadFile(payload: UploadFileDto): Promise<FileResponse> {
//     return this.filesService.uploadFile(payload);
//   }

//   @GrpcMethod(FILES_SERVICE_NAME, 'RemoveFile')
//   public async removeFile(payload: RequestByIdDto): Promise<FileResponse> {
//     return this.filesService.removeFile(payload);
//   }

//   @GrpcMethod(FILES_SERVICE_NAME, 'GetFile')
//   public async getFile(payload: RequestByIdDto): Promise<FileResponse> {
//     return this.filesService.getFile(payload);
//   }

//   @GrpcMethod(FILES_SERVICE_NAME, 'UpdateFile')
//   public async updateFile(payload: UpdateFileDto): Promise<FileResponse> {
//     return this.filesService.updateFile(payload);
//   }
// }
