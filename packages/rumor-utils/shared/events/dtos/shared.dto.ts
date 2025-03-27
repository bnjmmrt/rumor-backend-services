import { RequestById, UserAndIdRequest } from '../grpc/events/events.pb';
import { ParsedQs } from 'qs';
import { IsNotEmpty, IsOptional, IsString, IsUUID, isString } from 'class-validator';

export class RequestByIdDto implements RequestById {
  @IsNotEmpty()
  @IsUUID()
  id: string;
}

export class UserAndIdRequestDto implements UserAndIdRequest {
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsOptional()
  @IsUUID()
  userId?: string;
}

export type PaginationQuery = {
  take: string;
  skip: string;
};

export const hasPagination = (query: ParsedQs | null): query is PaginationQuery => {
  if (!query) return false;
  if (typeof query !== 'object') return false;
  const { take, skip } = query;
  if (!isString(take)) return false;
  if (isNaN(parseInt(take))) return false;
  if (!isString(skip)) return false;
  if (isNaN(parseInt(skip))) return false;
  return true;
};
