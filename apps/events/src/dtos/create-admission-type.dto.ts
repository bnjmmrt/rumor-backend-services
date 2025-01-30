import { IsNotEmpty, IsString } from 'class-validator';
import { CreateAdmissionTypeRequest } from '../grpc/events/events.pb';

export class CreateAdmissionTypeRequestDto implements CreateAdmissionTypeRequest {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;
}
