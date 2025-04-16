import { StatusCodes } from 'http-status-codes';

export const responses = {
  conflict: (message: string) => ({
    status: StatusCodes.CONFLICT,
    error: {
      type: 'conflict',
      message: message,
    },
  }),
  notFound: (message: string | null) => ({
    status: StatusCodes.NOT_FOUND,
    error: {
      type: 'user_not_found',
      message: message ?? 'Specified user not found',
    },
    data: null,
  }),
  badRequest: (message?: string) => ({
    status: StatusCodes.BAD_REQUEST,
    error: {
      type: 'bad_request',
      message: message ?? 'Bad Request',
    },
    data: null,
  }),
  forbidden: (message: string) => ({
    status: StatusCodes.FORBIDDEN,
    error: {
      type: 'forbidden',
      message: message ?? 'Bad Request',
    },
    data: null,
  }),
  ok: {
    status: StatusCodes.OK,
    error: null,
  },
  data: <T>(data: T) => ({
    status: StatusCodes.OK,
    error: null,
    data: data,
  }),

  verification: (verified: boolean) => ({
    status: StatusCodes.OK,
    error: undefined,
    data: {
      verified,
    },
  }),
};
