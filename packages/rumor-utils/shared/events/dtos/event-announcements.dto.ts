import {
    IsArray,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    ValidateNested,
    ArrayMinSize,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  
  // Attachment DTO
  export class EventAnnouncementAttachmentDto {
    @IsString()
    @IsNotEmpty()
    mediaType: string;
  
    @IsString()
    @IsNotEmpty()
    media: string;
  
    @IsString()
    @IsNotEmpty()
    mediaName: string;
  }
  
  // Main Event Announcement DTO
  export class CreateEventAnnouncementDto {
    @IsArray()
    @ArrayMinSize(1, { message: 'At least one ticketType ID is required.' })
    @IsUUID('all', { each: true })
    ticketType: string[];
  
    @IsArray()
    @ArrayMinSize(1, { message: 'At least one addedBy ID is required.' })
    @IsUUID('all', { each: true })
    addedBy: string[];
  
    @IsString()
    @IsNotEmpty({ message: 'Announcement is required.' })
    announcement: string;
  
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EventAnnouncementAttachmentDto)
    attachments?: EventAnnouncementAttachmentDto[];
  
    @IsOptional()
    @IsArray()
    @IsUUID('all', { each: true })
    recipients?: string[];
  }

  export class UpdateEventAnnouncementDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'Announcement cannot be empty when provided.' })
    announcement?: string;
  
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EventAnnouncementAttachmentDto)
    attachments?: EventAnnouncementAttachmentDto[];

  }
  