// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { EventTypes } from '../../entities/event-types.entity';

// @Injectable()
// export class SeedDatabase {
//   constructor(
//     @InjectRepository(EventTypes)
//     private readonly eventTypesRepository: Repository<EventTypes>,
//   ) {}

//   async seed() {
//     const dataExists = await this.eventTypesRepository.find({ take: 1 });
//     if (dataExists.length < 1) {
//       const data = [
//         {
//           name: 'After Parties',
//           description: 'Is an After Parties event type',
//           enabled: true,
//         },
//         {
//           name: 'Album Release',
//           description: 'Is an Album Release event type',
//           enabled: true,
//         },
//         {
//           name: 'Album Release',
//           description: 'Is an Album Release event type',
//           enabled: true,
//         },
//         {
//           name: 'Art Shows',
//           description: 'Is an Art Shows event type',
//           enabled: true,
//         },
//         {
//           name: 'Award Shows',
//           description: 'Is an Award Shows event type',
//           enabled: true,
//         },
//         {
//           name: 'Brand Experiences',
//           description: 'Is a Brand Experiences event type',
//           enabled: true,
//         },
//         {
//           name: 'Charity and Galas',
//           description: 'Is a Charity and Galas event type',
//           enabled: true,
//         },
//         {
//           name: 'Concerts',
//           description: 'Is a Concert event type',
//           enabled: true,
//         },
//         {
//           name: 'Culinary',
//           description: 'Is a Culinary event type',
//           enabled: true,
//         },
//         {
//           name: 'Fashion Shows',
//           description: 'Is a Fashion Shows event type',
//           enabled: true,
//         },
//         {
//           name: 'Film Festivals',
//           description: 'Is a Film Festivals event type',
//           enabled: true,
//         },
//         {
//           name: 'Health & Wellness',
//           description: 'Is a Health & Wellness event type',
//           enabled: true,
//         },
//         {
//           name: 'Music Festivals',
//           description: 'Is a Music Festivals event type',
//           enabled: true,
//         },
//         {
//           name: 'Movie Premieres',
//           description: 'Is a Movie Premieresevent type',
//           enabled: true,
//         },
//         {
//           name: 'Nightlife',
//           description: 'Is a Nightlife event type',
//           enabled: true,
//         },
//         {
//           name: 'Private Parties',
//           description: 'Is a Private Parties type',
//           enabled: true,
//         },
//         {
//           name: 'Product Launch',
//           description: 'Is a Product Launch type',
//           enabled: true,
//         },
//         {
//           name: 'Sporting Events',
//           description: 'Is a Sporting Events type',
//           enabled: true,
//         },
//         {
//           name: 'Seasonal Celebrations',
//           description: 'Is a Seasonal Celebrations type',
//           enabled: true,
//         },
//         {
//           name: 'Talks & Workshops',
//           description: 'Is a Talks & Workshop type',
//           enabled: true,
//         },
//         {
//           name: 'Tech',
//           description: 'Is a Tech type',
//           enabled: true,
//         },
//       ];
//       await this.eventTypesRepository.save(data);
//     }
//   }
// }
