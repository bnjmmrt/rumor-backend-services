// import { Module } from '@nestjs/common';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { JwtModule } from '@nestjs/jwt';
// import { RumorEntities, SharedModule } from '@rumor/shared';
// import { HealthController } from '@rumor/shared/health/grpc-health.controller';

// import { FilesController } from './controllers/files.controller';
// import { FilesService } from './services/files.service';
// import { S3Service } from '@rumor/shared/aws/s3.service';

// @Module({
//   imports: [
//     ConfigModule.forRoot({ isGlobal: true }),
//     TypeOrmModule.forRootAsync({
//       imports: [ConfigModule],
//       useFactory: (config: ConfigService) => {
//         return {
//           type: 'postgres',
//           host: config.get<string>('POSTGRES_HOST'),
//           port: config.get<number>('POSTGRES_PORT'),
//           username: config.get<string>('POSTGRES_USERNAME'),
//           password: config.get<string>('POSTGRES_PASSWORD'),
//           database: config.get<string>('POSTGRES_DATABASE'),
//           entities: [...RumorEntities],
//           ssl:
//             process.env.NODE_ENV === 'production'
//               ? {
//                   rejectUnauthorized: false, // this is temp for test server only
//                 }
//               : false,
//           synchronize: process.env.NODE_ENV === 'production' ? true : true,
//           migrationsTransactionMode: 'each',
//         };
//       },
//       inject: [ConfigService],
//     }),
//     TypeOrmModule.forFeature([]),
//     JwtModule.register({
//       secret: process.env.JWT_TOKEN,
//       signOptions: { expiresIn: '365d' },
//     }),
//     SharedModule,
//   ],
//   controllers: [FilesController, HealthController],
//   providers: [S3Service, FilesService],
// })
// export class FilesModule {}
