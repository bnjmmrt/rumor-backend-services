import { IsNotEmpty, IsString } from 'class-validator';
import { RequestFileById } from '../grpc/files/files.pb';

export class RequestByIdDto implements RequestFileById {
  @IsNotEmpty()
  @IsString()
  id: string;
}
