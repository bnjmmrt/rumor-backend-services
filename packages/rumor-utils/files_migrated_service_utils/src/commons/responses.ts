// import { HttpStatus } from '@nestjs/common';

// export const responses = {
//   conflict: (message: string) => ({
//     status: HttpStatus.CONFLICT,
//     error: {
//       type: 'CONFLICT',
//       message: message,
//     },
//   }),
//   notFound: (message: string | null) => ({
//     status: HttpStatus.NOT_FOUND,
//     error: {
//       type: 'NOT_FOUND',
//       message: message ?? 'Specified entity was not found',
//     },
//   }),
//   badRequest: (message?: string) => ({
//     status: HttpStatus.BAD_REQUEST,
//     error: {
//       type: 'bad_request',
//       message: message ?? 'Bad Request',
//     },
//     data: null,
//   }),
//   ok: {
//     status: HttpStatus.OK,
//     error: null,
//   },
//   data: <T>(data: T) => ({
//     status: HttpStatus.OK,
//     error: null,
//     data: data,
//   }),
// };
