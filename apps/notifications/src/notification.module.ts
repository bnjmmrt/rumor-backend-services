import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { NotificationController } from './controllers/notification.controller';
import { NotificationService } from './services/notification.service';
import { RumorEntities, SharedModule } from '@rumor/shared';
import { HealthController } from '@rumor/shared/health/grpc-health.controller';

import { Notification } from './entities/notification.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        return {
          type: 'postgres',
          host: config.get<string>('POSTGRES_HOST'),
          port: config.get<number>('POSTGRES_PORT'),
          username: config.get<string>('POSTGRES_USERNAME'),
          password: config.get<string>('POSTGRES_PASSWORD'),
          database: config.get<string>('POSTGRES_DATABASE'),
          entities: [...RumorEntities],
          ssl:
            process.env.NODE_ENV === 'production'
              ? {
                  rejectUnauthorized: false, // this is temp for test server only
                }
              : false,
          synchronize: process.env.NODE_ENV === 'production' ? true : true,
          migrationsTransactionMode: 'each',
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Notification]),
    JwtModule.register({
      secret: process.env.JWT_TOKEN,
      signOptions: { expiresIn: '365d' },
    }),
    SharedModule,
  ],
  controllers: [NotificationController, HealthController],
  providers: [NotificationService],
})
export class NotificationModule {}
