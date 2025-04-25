import {
  EventAgeLimit,
  EventTypes,
  SignupFormStaticQuestions,
} from 'rumor-utils/shared/entities/index';
import database from '../database';
import { QuestionValueType } from 'rumor-utils/shared/events/interfaces/event.interface';

export class Seeders {
  public static dbConnection = database;

  public static async seedEventTypes() {
    const eventTypesData = [
      { name: 'After Parties', description: 'Is an After Parties event type', enabled: true },
      { name: 'Album Release', description: 'Is an Album Release event type', enabled: true },
      { name: 'Art Shows', description: 'Is an Art Shows event type', enabled: true },
      { name: 'Award Shows', description: 'Is an Award Shows event type', enabled: true },
      {
        name: 'Brand Experiences',
        description: 'Is a Brand Experiences event type',
        enabled: true,
      },
      {
        name: 'Charity and Galas',
        description: 'Is a Charity and Galas event type',
        enabled: true,
      },
      { name: 'Concerts', description: 'Is a Concert event type', enabled: true },
      { name: 'Culinary', description: 'Is a Culinary event type', enabled: true },
      { name: 'Fashion Shows', description: 'Is a Fashion Shows event type', enabled: true },
      { name: 'Film Festivals', description: 'Is a Film Festivals event type', enabled: true },
      {
        name: 'Health & Wellness',
        description: 'Is a Health & Wellness event type',
        enabled: true,
      },
      { name: 'Music Festivals', description: 'Is a Music Festivals event type', enabled: true },
      { name: 'Movie Premieres', description: 'Is a Movie Premieres event type', enabled: true },
      { name: 'Nightlife', description: 'Is a Nightlife event type', enabled: true },
      { name: 'Private Parties', description: 'Is a Private Parties type', enabled: true },
      { name: 'Product Launch', description: 'Is a Product Launch type', enabled: true },
      { name: 'Sporting Events', description: 'Is a Sporting Events type', enabled: true },
      {
        name: 'Seasonal Celebrations',
        description: 'Is a Seasonal Celebrations type',
        enabled: true,
      },
      { name: 'Talks & Workshops', description: 'Is a Talks & Workshop type', enabled: true },
      { name: 'Tech', description: 'Is a Tech type', enabled: true },
    ];

    for (const eventTypeData of eventTypesData) {
      let eventType = await this.dbConnection
        .getRepository(EventTypes)
        .findOne({ where: { name: eventTypeData.name } });
      if (!eventType) {
        eventType = this.dbConnection.getRepository(EventTypes).create(eventTypeData);
        await this.dbConnection.getRepository(EventTypes).save(eventType);
      }
    }
  }

  public static async seedEventAgeLimits() {
    try {
      const data_exists = await this.dbConnection.getRepository(EventAgeLimit).find({ take: 1 });
      if (data_exists.length < 1) {
        const data = [
          {
            name: 'All ages',
            description: 'All ages are permitted',
            maxAge: 120,
            minAge: 0,
            enabled: true,
          },
          {
            name: '21+',
            description: '21 years old or more',
            maxAge: 120,
            minAge: 21,
            enabled: true,
          },
          {
            name: '18+',
            description: '18 years old or more',
            maxAge: 120,
            minAge: 18,
            enabled: true,
          },
        ];
        await this.dbConnection.getRepository(EventAgeLimit).save(data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  public static async seedSignupFormStaticQuestions() {
    const questionsData = [
      {
        name: 'First Name',
        type: QuestionValueType.STRING,
        is_default: true,
        is_active: true,
        is_required: true,
        key: 'firstName',
      },
      {
        name: 'Last Name',
        type: QuestionValueType.STRING,
        is_default: true,
        is_active: true,
        is_required: true,
        key: 'lastName',
      },
      {
        name: 'Email',
        type: QuestionValueType.STRING,
        is_default: true,
        is_active: true,
        is_required: true,
        key: 'email',
      },
      {
        name: 'Phone',
        type: QuestionValueType.STRING,
        is_default: true,
        is_active: true,
        is_required: true,
        key: 'phone',
      },
      {
        name: 'Request Access for Additional Guests',
        type: QuestionValueType.NUMBER,
        is_default: true,
        is_active: true,
        is_required: true,
        key: 'requestAdditionalGuests',
      },
      {
        name: 'What is your Instagram handle?',
        type: QuestionValueType.STRING,
        is_default: true,
        is_active: true,
        is_required: false,
        key: 'instagram',
      },
      {
        name: 'Gender',
        type: QuestionValueType.STRING,
        is_default: true,
        is_active: true,
        is_required: false,
        key: 'gender',
      },
    ];

    for (const questionData of questionsData) {
      let question = await this.dbConnection
        .getRepository(SignupFormStaticQuestions)
        .findOne({ where: { key: questionData.key } });
      if (!question) {
        question = this.dbConnection.getRepository(SignupFormStaticQuestions).create(questionData);
        await this.dbConnection.getRepository(SignupFormStaticQuestions).save(question);
      }
    }
  }
}
