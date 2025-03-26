import { Observable } from 'rxjs';

export const protobufPackage = 'files';

/** Error */
export interface Error {
  type: string;
  message: string;
}

/** File */
export interface File {
  fileKeyId: string;
  filename?: string | undefined;
  type?: string | undefined;
  size?: string | undefined;
  contentType?: string | undefined;
  pathFileUrl: string;
}

/** UploadFileRequest */
export interface UploadFileRequest {
  filename: string;
  type: string;
  size: number;
  contentType: string;
  file: Uint8Array;
}

/** FileResponse */
export interface FileResponse {
  status: number;
  error?: Error | undefined;
  data?: File | undefined;
}

/** GetFileRequest or RemoveFileRequest */
export interface RequestFileById {
  id: string;
}

/** RemoveFileResponse */
export interface RemoveFileResponse {
  status: number;
  error?: Error | undefined;
}

/** UpdateFileRequest */
export interface UpdateFileRequest {
  fileKeyId: string;
  filename: string;
  type: string;
  size: number;
  contentType: string;
  file: Uint8Array;
}

export interface GetSignedUploadUrlRequest {
  path: string;
  size?: number | undefined;
  contentType?: string | undefined;
  extension?: string | undefined;
}

export const FILES_PACKAGE_NAME = 'files';

export interface FilesServiceClient {
  uploadFile(request: UploadFileRequest): Observable<FileResponse>;

  getFile(request: RequestFileById): Observable<FileResponse>;

  removeFile(request: RequestFileById): Observable<RemoveFileResponse>;

  updateFile(request: UpdateFileRequest): Observable<FileResponse>;

  /** S3 API for generating Pre-Signed URL */

  getSignedUploadUrl(request: GetSignedUploadUrlRequest): Observable<FileResponse>;
}

export interface FilesServiceController {
  uploadFile(
    request: UploadFileRequest,
  ): Promise<FileResponse> | Observable<FileResponse> | FileResponse;

  getFile(
    request: RequestFileById,
  ): Promise<FileResponse> | Observable<FileResponse> | FileResponse;

  removeFile(
    request: RequestFileById,
  ): Promise<RemoveFileResponse> | Observable<RemoveFileResponse> | RemoveFileResponse;

  updateFile(
    request: UpdateFileRequest,
  ): Promise<FileResponse> | Observable<FileResponse> | FileResponse;

  /** S3 API for generating Pre-Signed URL */

  getSignedUploadUrl(
    request: GetSignedUploadUrlRequest,
  ): Promise<FileResponse> | Observable<FileResponse> | FileResponse;
}

// export function FilesServiceControllerMethods() {
//   return function (constructor: Function) {
//     const grpcMethods: string[] = ["uploadFile", "getFile", "removeFile", "updateFile", "getSignedUploadUrl"];
//     for (const method of grpcMethods) {
//       const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
//       GrpcMethod("FilesService", method)(constructor.prototype[method], method, descriptor);
//     }
//     const grpcStreamMethods: string[] = [];
//     for (const method of grpcStreamMethods) {
//       const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
//       GrpcStreamMethod("FilesService", method)(constructor.prototype[method], method, descriptor);
//     }
//   };
// }

export const FILES_SERVICE_NAME = 'FilesService';
