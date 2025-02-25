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

export { FilePayload, FileDataResponse };
