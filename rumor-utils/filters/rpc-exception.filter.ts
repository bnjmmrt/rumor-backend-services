// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
// import { RpcExceptionFilter as NestRpcExceptionFilter } from '@nestjs/common/interfaces';
// import { Observable, of } from 'rxjs';
// import RumorException from '../errors';

// type Response = {
//   status: HttpStatus;
//   error: {
//     type: string;
//     message: string;
//   };
// };
// @Catch()
// export class RpcExceptionFilter implements NestRpcExceptionFilter<Error> {
//   private productionMode: boolean;
//   private readonly logger = new Logger('UnrecognizedErrors');
//   constructor() {
//     this.productionMode = process.env.CLUSTER_ENVIRONMENT === 'production';
//   }
//   catch(exception: Error): Observable<Response> {
//     if (exception instanceof HttpException) {
//       if (exception.getStatus() === HttpStatus.BAD_REQUEST) {
//         const res: any = exception.getResponse();
//         const message = res.message;
//         if (Array.isArray(message)) {
//           return of({
//             status: HttpStatus.BAD_REQUEST,
//             error: {
//               type: 'BAD_REQUEST',
//               message: `Validation errors: ${message.join('\n\t')}`,
//             },
//           });
//         }
//         if (typeof message === 'string') {
//           return of({
//             status: HttpStatus.BAD_REQUEST,
//             error: {
//               type: 'BAD_REQUEST',
//               message: message,
//             },
//           });
//         }
//         return of({
//           status: HttpStatus.BAD_REQUEST,
//           error: {
//             type: 'BAD_REQUEST',
//             message: message,
//           },
//         });
//       }
//     }

//     if (exception instanceof RumorException) {
//       return of(exception.getError() as Response);
//     }

//     this.logger.error(exception.message, exception.stack);
//     return of({
//       status: HttpStatus.INTERNAL_SERVER_ERROR,
//       error: {
//         type: 'INTERNAL_ERROR',
//         message: this.productionMode ? 'Something went wrong on our side' : exception.message,
//       },
//     });
//   }
// }
