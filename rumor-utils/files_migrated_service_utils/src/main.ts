// import { INestMicroservice, ValidationPipe } from '@nestjs/common';
// import { NestFactory } from '@nestjs/core';
// import { Transport } from '@nestjs/microservices';
// import { protobufPackage as healthProtobufPackage } from '@rumor/shared/health/grpc/health/health.pb';
// import { protobufPackage } from './grpc/files/files.pb';
// import { LoggingInterceptor } from '@rumor/shared/middlewares/logger.middleware';
// import { RpcExceptionFilter } from '@rumor/shared/filters/rpc-exception.filter';
// import { FilesModule } from './files.module';

// async function bootstrap() {
//   const app: INestMicroservice = await NestFactory.createMicroservice(FilesModule, {
//     transport: Transport.GRPC,
//     options: {
//       url: `${process.env.MICROSERVICE_TRANSPORTER_URL_HOST ?? '0.0.0.0'}:50054`,
//       package: [protobufPackage, healthProtobufPackage],
//       protoPath: ['node_modules/rumor-grpc/grpc/files/files.proto', 'node_modules/rumor-grpc/grpc/health/health.proto'],
//       loader: {
//         defaults: true,
//       },
//     },
//   });

//   app.useGlobalInterceptors(new LoggingInterceptor(FilesModule.name));
//   app.useGlobalFilters(new RpcExceptionFilter());
//   app.useGlobalPipes(
//     new ValidationPipe({
//       whitelist: true,
//       transform: true,
//     }),
//   );

//   await app.listen();
// }

// bootstrap();
