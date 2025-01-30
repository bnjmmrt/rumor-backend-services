// import { INestMicroservice, ValidationPipe } from '@nestjs/common';
// import { NestFactory } from '@nestjs/core';
// import { Transport } from '@nestjs/microservices';
// import { protobufPackage as healthProtobufPackage } from 'rumor-utils/health/grpc/health/health.pb';
// import { protobufPackage } from './grpc/events/events.pb';
// import { LoggingInterceptor } from 'rumor-utils/middlewares/logger.middleware';
// import { RpcExceptionFilter } from 'rumor-utils/filters/rpc-exception.filter';
// import { EventsModule } from './events.module';
// import { SeedDatabase as SeedDatabaseEventTypes } from './database/seeders/event-types.seed';
// import { EventAgeLimitSeeder } from './database/seeders/event-age-limit.seed';
// import { SeedDatabaseRoleSettings } from './database/seeders/default-role-settings.seed';
// import { join } from 'path';

// async function bootstrap() {
//   const app: INestMicroservice = await NestFactory.createMicroservice(EventsModule, {
//     transport: Transport.GRPC,
//     options: {
//       url: `${process.env.MICROSERVICE_TRANSPORTER_URL_HOST ?? '0.0.0.0'}:50053`,
//       package: [protobufPackage, healthProtobufPackage],
//       protoPath: [
//         'node_modules/rumor-grpc/grpc/events/events.proto',
//         'node_modules/rumor-grpc/grpc/events/general.proto',
//         'node_modules/rumor-grpc/grpc/health/health.proto',
//       ],
//       loader: {
//         defaults: true,
//         includeDirs: [join(__dirname, '../../../node_modules/rumor-grpc/'), join(__dirname, '../../../')],
//       },
//     },
//   });

//   app.useGlobalInterceptors(new LoggingInterceptor(EventsModule.name));
//   app.useGlobalFilters(new RpcExceptionFilter());
//   app.useGlobalPipes(
//     new ValidationPipe({
//       whitelist: true,
//       transform: true,
//     }),
//   );

//   const seedDatabaseRoleSettings = app.get(SeedDatabaseRoleSettings);
//   seedDatabaseRoleSettings.seed();

//   const seedServiceEventTypes = app.get(SeedDatabaseEventTypes);
//   await seedServiceEventTypes.seed();

//   const seedServiceAgeLimit = app.get(EventAgeLimitSeeder);
//   await seedServiceAgeLimit.seed();

//   await app.listen();
// }

// bootstrap();
