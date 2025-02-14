import { INestMicroservice, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { protobufPackage as healthProtobufPackage } from '@rumor/shared/health/grpc/health/health.pb';
import { NotificationModule } from './notification.module';
import { protobufPackage } from './grpc/notification/notification.pb';
import { LoggingInterceptor } from '@rumor/shared/middlewares/logger.middleware';
import { RpcExceptionFilter } from '@rumor/shared/filters/rpc-exception.filter';

async function bootstrap() {
  const app: INestMicroservice = await NestFactory.createMicroservice(NotificationModule, {
    transport: Transport.GRPC,
    options: {
      url: `${process.env.MICROSERVICE_TRANSPORTER_URL_HOST ?? '0.0.0.0'}:50056`,
      package: [protobufPackage, healthProtobufPackage],
      protoPath: ['node_modules/rumor-grpc/grpc/notification/notification.proto', 'node_modules/rumor-grpc/grpc/health/health.proto'],
      loader: {
        defaults: true,
      },
    },
  });

  app.useGlobalInterceptors(new LoggingInterceptor(NotificationModule.name));
  app.useGlobalFilters(new RpcExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen();
}

bootstrap();
