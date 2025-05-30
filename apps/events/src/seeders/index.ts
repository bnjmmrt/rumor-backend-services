import {
  EventAgeLimit,
  EventTypes,
  SignupFormStaticQuestions,
  Event,
} from 'rumor-utils/shared/entities/index';
import database from '../database';
import { QuestionValueType } from 'rumor-utils/shared/events/interfaces/event.interface';
import { generateBranchLink } from '../utils/branch.utils';
import config from '../config';
import { SponsorshipCategory } from 'rumor-utils/shared/sponsorships/entities/sponsorship-category.entity';

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

    const repository = this.dbConnection.getRepository(EventTypes);

    for (const eventTypeData of eventTypesData) {
      let eventType = await repository.findOne({ where: { name: eventTypeData.name } });
      if (!eventType) {
        eventType = repository.create(eventTypeData);
        await repository.save(eventType);
      } else {
        let hasChanges = false;
        for (const [key, value] of Object.entries(eventTypeData)) {
          if (eventType[key] !== value) {
            hasChanges = true;
            break;
          }
        }

        if (hasChanges) {
          Object.assign(eventType, eventTypeData);
          await repository.save(eventType);
        }
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
        isDefault: true,
        isActive: true,
        isRequired: true,
        key: 'firstName',
        hasToggle: false,
        isToggled: false,
      },
      {
        name: 'Last Name',
        type: QuestionValueType.STRING,
        isDefault: true,
        isActive: true,
        isRequired: true,
        key: 'lastName',
        hasToggle: false,
        isToggled: false,
      },
      {
        name: 'Email',
        type: QuestionValueType.STRING,
        isDefault: true,
        isActive: true,
        isRequired: true,
        key: 'email',
        hasToggle: false,
        isToggled: false,
      },
      {
        name: 'Phone',
        type: QuestionValueType.STRING,
        isDefault: true,
        isActive: true,
        isRequired: true,
        key: 'phone',
        hasToggle: false,
        isToggled: false,
      },
      {
        name: 'Request Access for Additional Guests',
        type: QuestionValueType.NUMBER,
        isDefault: true,
        isActive: true,
        isRequired: true,
        key: 'requestAdditionalGuests',
        hasToggle: true,
        isToggled: true,
      },
      {
        name: 'What is your Instagram handle?',
        type: QuestionValueType.STRING,
        isDefault: true,
        isActive: true,
        isRequired: true,
        key: 'instagram',
        hasToggle: true,
        isToggled: true,
      },
      {
        name: 'Gender',
        type: QuestionValueType.STRING,
        isDefault: true,
        isActive: true,
        isRequired: false,
        key: 'gender',
        hasToggle: true,
        isToggled: true,
      },
    ];

    const repository = this.dbConnection.getRepository(SignupFormStaticQuestions);

    for (const questionData of questionsData) {
      let question = await repository.findOne({ where: { key: questionData.key } });

      if (!question) {
        question = repository.create(questionData);
        await repository.save(question);
      } else {
        let hasChanges = false;
        for (const [key, value] of Object.entries(questionData)) {
          if (question[key] !== value) {
            hasChanges = true;
            break;
          }
        }

        if (hasChanges) {
          Object.assign(question, questionData);
          await repository.save(question);
        }
      }
    }
  }

  public static async seedEventBranchLinks() {
    const isProduction = process.env.NODE_ENV === 'production';
    const maxAttempts = isProduction ? 50 : 1;

    try {
      console.log(`Starting ${isProduction ? 'continuous' : 'single-pass'} branch links seeder...`);

      let totalAttempts = 0;

      while (totalAttempts < maxAttempts) {
        totalAttempts++;

        // Find all events that don't have a branch link
        const eventsWithoutBranchLinks = await this.dbConnection
          .getRepository(Event)
          .createQueryBuilder('event')
          .where("event.branchLink IS NULL OR event.branchLink = ''")
          .andWhere('event.deletedAt IS NULL')
          .getMany();

        if (eventsWithoutBranchLinks.length === 0) {
          if (isProduction) {
            console.log(
              `🎉 All events now have branch links! Completed after ${totalAttempts} attempt(s).`,
            );
          } else {
            console.log('No events found without branch links.');
          }
          break;
        }

        if (isProduction) {
          console.log(
            `Attempt ${totalAttempts}: Found ${eventsWithoutBranchLinks.length} events without branch links. Processing...`,
          );
        } else {
          console.log(
            `Found ${eventsWithoutBranchLinks.length} events without branch links. Processing...`,
          );
        }

        let successCount = 0;
        let errorCount = 0;

        // Process events in batches to avoid overwhelming the Branch API
        const batchSize = 10;
        for (let i = 0; i < eventsWithoutBranchLinks.length; i += batchSize) {
          const batch = eventsWithoutBranchLinks.slice(i, i + batchSize);

          const results = await Promise.allSettled(
            batch.map(async event => {
              try {
                // Generate branch link for the event
                const webUrl = `${config.get('RUMOR_WEBSITE_HOST')}/events/event-details?id=${event.id}`;
                const deepLinkPath = `events/event-details?id=${event.id}`;

                const branchData = {
                  $web_only: false,
                  $fallback_url: webUrl,
                  $ios_url: `therumorapp://${deepLinkPath}`,
                  $android_url: `com.therumor://${deepLinkPath}`,
                  $desktop_url: webUrl,
                  $marketing_title: `Event: ${event.name}`,
                };

                const branchLink = await generateBranchLink({
                  path: deepLinkPath,
                  data: branchData,
                });

                // Update the event with the generated branch link
                await this.dbConnection
                  .getRepository(Event)
                  .update({ id: event.id }, { branchLink });

                console.log(`✅ Generated branch link for event: ${event.name} (ID: ${event.id})`);
                return { success: true, event };
              } catch (error) {
                console.error(
                  `❌ Failed to generate branch link for event: ${event.name} (ID: ${event.id})`,
                  error,
                );
                return { success: false, event, error };
              }
            }),
          );

          // Count results
          results.forEach(result => {
            if (result.status === 'fulfilled' && result.value.success) {
              successCount++;
            } else {
              errorCount++;
            }
          });

          // Add a small delay between batches to be respectful to the Branch API
          if (i + batchSize < eventsWithoutBranchLinks.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        if (isProduction) {
          console.log(`Attempt ${totalAttempts} completed:`);
        } else {
          console.log(`Branch links seeder completed:`);
        }
        console.log(`  ✅ Success: ${successCount} events`);
        console.log(`  ❌ Errors: ${errorCount} events`);

        // If not production, break after first attempt
        if (!isProduction) {
          return { successCount, errorCount, totalProcessed: eventsWithoutBranchLinks.length };
        }

        // If production and we had errors, wait a bit before the next attempt
        if (errorCount > 0) {
          console.log('Waiting 5 seconds before next attempt due to errors...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        } else if (eventsWithoutBranchLinks.length > 0) {
          // Small delay between successful runs in production
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      if (isProduction && totalAttempts >= maxAttempts) {
        console.warn(
          `⚠️ Reached maximum attempts (${maxAttempts}). Some events may still be missing branch links.`,
        );

        // Final check
        const remainingEvents = await this.dbConnection
          .getRepository(Event)
          .createQueryBuilder('event')
          .where("event.branchLink IS NULL OR event.branchLink = ''")
          .andWhere('event.deletedAt IS NULL')
          .getMany();

        if (remainingEvents.length > 0) {
          console.log(`${remainingEvents.length} events still don't have branch links.`);
        }
      }
    } catch (error) {
      console.error('Error in seedEventBranchLinks:', error);
      throw error;
    }
  }

  public static async seedSponsorshipCategories() {
    const category = {
      name: 'Generally Restricted Categories',
      enabled: true,
    };

    const repository = this.dbConnection.getRepository(SponsorshipCategory);
    const existingCategory = await repository.findOne({
      where: { name: category.name, deletedAt: null },
    });

    if (!existingCategory) {
      const newCategory = repository.create(category);
      await repository.save(newCategory);
    }
  }
}
