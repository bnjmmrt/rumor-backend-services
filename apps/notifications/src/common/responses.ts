import { HttpStatus } from '@nestjs/common';

export const responses = {
  conflict: (message: string) => ({
    status: HttpStatus.CONFLICT,
    error: {
      type: 'conflict',
      message: message,
    },
  }),
  notFound: (message: string | null) => ({
    status: HttpStatus.NOT_FOUND,
    error: {
      type: 'not_found',
      message: message ?? 'entity not found',
    },
  }),
  badRequest: (message?: string) => ({
    status: HttpStatus.BAD_REQUEST,
    error: {
      type: 'bad_request',
      message: message ?? 'Bad Request',
    },
    data: null,
  }),
  forbidden: (message: string) => ({
    status: HttpStatus.FORBIDDEN,
    error: {
      type: 'forbidden',
      message: message ?? 'Bad Request',
    },
  }),
  ok: {
    status: HttpStatus.OK,
    error: null,
  },
  data: <T>(data: T) => ({
    status: HttpStatus.OK,
    error: null,
    data: data,
  }),
  verification: (verified: boolean) => ({
    status: HttpStatus.OK,
    error: undefined,
    data: {
      verified,
    },
  }),
};
