import { StatusCodes } from 'http-status-codes';

export const responses = {
  conflict: (message: string) => ({
    status: StatusCodes.CONFLICT,
    error: {
      type: 'CONFLICT',
      message: message,
    },
  }),
  notFound: (message: string | null) => ({
    status: StatusCodes.NOT_FOUND,
    error: {
      type: 'NOT_FOUND',
      message: message ?? 'Specified entity was not found',
    },
  }),
  badRequest: (message?: string) => ({
    status: StatusCodes.BAD_REQUEST,
    error: {
      type: 'bad_request',
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
};
