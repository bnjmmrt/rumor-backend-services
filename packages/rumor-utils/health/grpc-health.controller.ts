// import { Controller, HttpStatus } from '@nestjs/common';
// import { GrpcMethod } from '@nestjs/microservices';
// import { CheckHealthResponse, HEALTH_SERVICE_NAME, HealthCheckResponse, HealthCheckResponse_ServingStatus } from './grpc/health/health.pb';

// @Controller('health')
// export class HealthController {
//   @GrpcMethod(HEALTH_SERVICE_NAME, 'Check')
//   private async check(): Promise<HealthCheckResponse> {
//     return {
//       status: HealthCheckResponse_ServingStatus.SERVING,
//     };
//   }

//   @GrpcMethod(HEALTH_SERVICE_NAME, 'CheckHealth')
//   private async checkHealth(): Promise<CheckHealthResponse> {
//     return {
//       status: HttpStatus.OK,
//       data: {
//         message: 'SERVING',
//       },
//     };
//   }
// }
