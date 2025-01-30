import { ParsedQs } from 'qs';
import { TokenRequest, PaginatedRequest, UserAndIdRequest, IdRequest } from '../grpc/auth/shared.pb';
import { IsNotEmpty, IsOptional, IsString, IsUUID, isString } from 'class-validator';

export class TokenRequestDto implements TokenRequest {
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class IdRequestDto implements IdRequest {
  @IsUUID()
  @IsNotEmpty()
  id: string;
}

export class UserAndIdRequestDto implements UserAndIdRequest {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsNotEmpty()
  id: string;
}

export class PaginatedRequestDto implements PaginatedRequest {
  @IsUUID()
  @IsOptional()
  userId: string;
  @IsString()
  @IsNotEmpty()
  query: string;
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
