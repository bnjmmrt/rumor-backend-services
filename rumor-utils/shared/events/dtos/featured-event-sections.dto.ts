import { IsNotEmpty, IsString } from 'class-validator';
import { CreateFeaturedEventSectionRequest } from '../grpc/platform/platform.pb';

export class CreateFeaturedEventSectionRequestDto implements CreateFeaturedEventSectionRequest {
  @IsString()
  @IsNotEmpty()
  name: string;
}
