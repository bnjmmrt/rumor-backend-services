// import { Injectable, Logger, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
// import { tap } from 'rxjs';

// @Injectable()
// export class LoggingInterceptor implements NestInterceptor {
//   constructor(private readonly serviceTag: string) {}
//   intercept(context: ExecutionContext, next: CallHandler) {
//     const rpcReq = context.switchToRpc().getData();
//     const args = context.getArgs();
//     return next.handle().pipe(
//       tap(async (data) => {
//         if (!Object.keys(rpcReq).includes('service')) {
//           Logger.log(`[${this.serviceTag}] Handler: ${Buffer.from(JSON.stringify(args))}`);
//           Logger.log(`[${this.serviceTag}] RPC Request: ${Buffer.from(JSON.stringify(rpcReq))}`);
//           Logger.log(`[${this.serviceTag}] Date: ${new Date().toISOString()}`);
//           Logger.log(`[${this.serviceTag}] Response: ${Buffer.from(JSON.stringify(data))}\n\n`);
//         }
//       }),
//     );
//   }
// }
