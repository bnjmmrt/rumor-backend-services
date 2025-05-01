import { CreateEventRequestDto, UpdateEventRequestDto } from '../shared/events/dtos/events.dto';
import { CreateEventAnnouncementDto, UpdateEventAnnouncementDto } from '../shared/events/dtos';

export const eventAnnouncement = {
  POST: CreateEventAnnouncementDto,
  PATCH: UpdateEventAnnouncementDto,
};

export const event = {
  POST: CreateEventRequestDto,
  PUT: UpdateEventRequestDto
};

export const guest = {};
