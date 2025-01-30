// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';

// import { EventAgeLimit } from '../../entities/event-age-limit.entity';

// @Injectable()
// export class EventAgeLimitSeeder {
//   constructor(
//     @InjectRepository(EventAgeLimit)
//     private readonly eventAgeLimitRepository: Repository<EventAgeLimit>,
//   ) {}

//   async seed() {
//     const data_exists = await this.eventAgeLimitRepository.find({ take: 1 });
//     if (data_exists.length < 1) {
//       const data = [
//         {
//           name: 'All ages',
//           description: 'All ages are permitted',
//           maxAge: 120,
//           minAge: 0,
//           enabled: true,
//         },
//         {
//           name: '21+',
//           description: '21 years old or more',
//           maxAge: 120,
//           minAge: 21,
//           enabled: true,
//         },
//         {
//           name: '18+',
//           description: '18 years old or more',
//           maxAge: 120,
//           minAge: 18,
//           enabled: true,
//         },
//       ];
//       await this.eventAgeLimitRepository.save(data);
//     }
//   }
// }
