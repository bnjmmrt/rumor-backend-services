// import { Module } from '@nestjs/common';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { JwtModule } from '@nestjs/jwt';
// import { RumorEntities, SharedModule } from '@rumor/shared';
// import { HealthController } from 'rumor-utils/health/grpc-health.controller';
// import { EventsController } from './controllers/events.controller';
// import { TicketTypeController } from './controllers/ticket-type.controller';
// import { QuizQuestionController } from './controllers/quiz-question.controller';
// import { GuestController } from './controllers/guest.controller';
// import { GuestService } from './services/guest.service';
// import { EventsService } from './services/events.service';
// import { TalentController } from './controllers/talent.controller';
// import { TalentService } from './services/talent.service';
// import { AdmissionType, Collaborator, Event, EventTypes, QuizQuestion, Talent, TicketType, EventLocation, UserAttendeeStats } from './entities';
// import { QuizQuestionService } from './services/quiz-question.service';
// import { AdmissionTypeService } from './services/admission-type.service';
// import { AdmissionTypeController } from './controllers/admission-type.controller';
// import { TicketTypeService } from './services/ticket-type.service';
// import { SeedDatabase as SeedDatabaseEventTypes } from './database/seeders/event-types.seed';
// import { CollaboratorService } from './services/collaborator.service';
// import { CollaboratorController } from './controllers/collaborator.controller';
// import { GoogleAddressClient } from 'libs/shared/src/clients/googleAddress.client';
// import { EventAgeLimitSeeder } from './database/seeders/event-age-limit.seed';
// import { EventAgeLimit } from './entities/event-age-limit.entity';
// import { Guest } from './entities/guest.entity';
// import { UserQuizAnswer } from './entities/user-quiz-question-answer.entity';

// import { DefaultRoleSettings } from './entities/default-role-settings.entity';
// import { SeedDatabaseRoleSettings } from './database/seeders/default-role-settings.seed';
// import { Ticket } from './entities/ticket.entity';

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
//     TypeOrmModule.forFeature([
//       AdmissionType,
//       Collaborator,
//       Event,
//       EventTypes,
//       QuizQuestion,
//       Talent,
//       TicketType,
//       EventLocation,
//       EventAgeLimit,
//       Guest,
//       UserAttendeeStats,
//       UserQuizAnswer,
//       DefaultRoleSettings,
//       Ticket,
//     ]),
//     JwtModule.register({
//       secret: process.env.JWT_TOKEN,
//       signOptions: { expiresIn: '365d' },
//     }),
//     SharedModule,
//   ],
//   controllers: [
//     AdmissionTypeController,
//     EventsController,
//     HealthController,
//     TalentController,
//     TicketTypeController,
//     CollaboratorController,
//     QuizQuestionController,
//     GuestController,
//   ],
//   providers: [
//     AdmissionTypeService,
//     EventsService,
//     TalentService,
//     TicketTypeService,
//     SeedDatabaseEventTypes,
//     CollaboratorService,
//     QuizQuestionService,
//     GuestService,
//     GoogleAddressClient,
//     EventAgeLimitSeeder,
//     SeedDatabaseRoleSettings,
//   ],
// })
// export class EventsModule {}
