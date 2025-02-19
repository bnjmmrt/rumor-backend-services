// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Interest } from '../../entities/interest.entity';

// @Injectable()
// export class SeedDatabase {
//   constructor(
//     @InjectRepository(Interest)
//     private readonly interestRepository: Repository<Interest>,
//   ) {}

//   async seed() {
//     const dataExists = await this.interestRepository.find({ take: 1 });
//     if (dataExists.length < 1) {
//       const data = [
//         {
//           name: 'Art',
//           description: 'Interested in art',
//           enabled: true,
//         },
//         {
//           name: 'Automotive',
//           description: 'Interested in automotive',
//           enabled: true,
//         },
//         {
//           name: 'Beauty',
//           description: 'Interested in beauty',
//           enabled: true,
//         },
//         {
//           name: 'Business',
//           description: 'Interested in business',
//           enabled: true,
//         },
//         {
//           name: 'Fashion',
//           description: 'Interested in fashion',
//           enabled: true,
//         },
//         {
//           name: 'Fitness',
//           description: 'Interested in fitness',
//           enabled: true,
//         },
//         {
//           name: 'Food',
//           description: 'Interested in food',
//           enabled: true,
//         },
//         {
//           name: 'Hospitality',
//           description: 'Interested in hospitality',
//           enabled: true,
//         },
//         {
//           name: 'Humor',
//           description: 'Interested in humor',
//           enabled: true,
//         },
//         {
//           name: 'Luxury',
//           description: 'Interested in luxury',
//           enabled: true,
//         },
//         {
//           name: 'Lifestyle',
//           description: 'Interested in lifestyle',
//           enabled: true,
//         },
//         {
//           name: 'Music',
//           description: 'Interested in music',
//           enabled: true,
//         },
//         {
//           name: 'Personal Growth',
//           description: 'Interested in personal growth',
//           enabled: true,
//         },
//         {
//           name: 'Philanthropy',
//           description: 'Interested in philanthropy',
//           enabled: true,
//         },
//         {
//           name: 'Sports',
//           description: 'Interested in sports',
//           enabled: true,
//         },
//         {
//           name: 'Technology',
//           description: 'Interested in technology',
//           enabled: true,
//         },
//         {
//           name: 'Wellness',
//           description: 'Interested in wellness',
//           enabled: true,
//         },
//       ];
//       await this.interestRepository.save(data);
//     }
//   }
// }
