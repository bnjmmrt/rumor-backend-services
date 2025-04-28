import {
  EventGuestRequest,
  SignupFormsResponse,
  UserSource,
} from 'rumor-utils/shared/events/grpc/events/general.pb';
import { buildSignupFormsResponse } from 'rumor-utils/shared/events/mappers/signup-forms.mapper';
import { SignupFormStaticQuestions } from 'rumor-utils/shared/events/entities/signup-form-static-questions.entity';
import {
  Event,
  EventSignupForms,
  SignupFormQuestions,
  SignupFormSubmissions,
  User,
  UserRole,
  Role,
  Guest,
} from 'rumor-utils/shared/entities';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from 'rumor-utils/errors';
import database from '../database';
import {
  CreateSignupFormDto,
  SignupFormAnswersDto,
} from 'rumor-utils/shared/events/dtos/signup-forms.dto';
import { parse } from 'qs';
import { Brackets, DataSource, QueryRunner, UpdateResult } from 'typeorm';
import { isUUID } from 'class-validator';
import { EventStatusEnum, GuestStatus } from 'rumor-utils/shared/events/interfaces/event.interface';
import config from '../config';
import serviceMesh from '../server/helpers/serviceMeshHandler';
import { NotificationType } from 'rumor-utils/shared/notifications/grpc/notification/notification.pb';
import { isValidEmail, isValidPhoneNumber } from 'rumor-utils/utils/file-utils';
import { HostUserMapping } from 'rumor-utils/shared/users/entities/host-user-mapping.entity';
import { UserSource as UserSourceEnum } from 'rumor-utils/shared/users/interfaces/shared.interface';

export class SignupFormsServices {
  public static dbConnection = database;
  public static dataSource: DataSource;
  public static async getStaticQuestions() {
    const staticQuestions = await SignupFormStaticQuestions.find({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        type: true,
        isRequired: true,
        isToggled: true,
        hasToggle: true,
      },
    });
    return staticQuestions;
  }

  public static async get(id: string, eventId: string): Promise<SignupFormsResponse> {
    const event: Event | undefined = await Event.findOne({
      where: { id: eventId },
      relations: {
        collaborators: true,
        ageLimit: true,
        talents: true,
        owner: true,
        eventType: true,
        location: true,
      },
    });
    if (!event) {
      throw new NotFoundError('Event');
    }
    const signupForm: EventSignupForms = await EventSignupForms.findOne({
      where: { id: id, event: { id: eventId } },
      relations: { createdBy: true, questions: true },
    });

    const baseUrl: string = config.get('SIGNUP_FORM_BASE_URL') || '';
    const data = buildSignupFormsResponse(event, signupForm, baseUrl);
    return data;
  }

  public static async getByEventId(
    eventId: string,
    hostId: string,
  ): Promise<SignupFormsResponse[]> {
    try {
      const event: Event | undefined = await Event.findOne({
        where: { id: eventId, owner: { id: hostId } },
        relations: { owner: true },
      });
      if (!event) {
        throw new NotFoundError('Event');
      }
      const signupForms = await EventSignupForms.find({
        where: { event: { id: eventId } },
        relations: { submissions: true, createdBy: true },
      });

      const resultList: SignupFormsResponse[] = [];

      const baseUrl: string = config.get('SIGNUP_FORM_BASE_URL') || '';
      signupForms.forEach(sf =>
        resultList.push(buildSignupFormsResponse(event, sf, baseUrl, sf.submissions.length)),
      );
      return resultList;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get By urlcode
   * @param code
   * @returns
   */
  public static async getByUrl(code: string) {
    try {
      const eventSignupForm: EventSignupForms | undefined = await EventSignupForms.findOne({
        where: {
          urlCode: code,
          isPublished: true,
        },
        relations: {
          event: {
            collaborators: true,
            ageLimit: true,
            talents: true,
            owner: true,
            eventType: true,
            location: true,
          },
          createdBy: true,
          questions: true,
        },
      });

      if (!eventSignupForm) {
        throw new ForbiddenError('SignupForm does not exists');
      }
      const baseUrl: string = config.get('SIGNUP_FORM_BASE_URL') || '';
      const data = buildSignupFormsResponse(eventSignupForm.event, eventSignupForm, baseUrl);

      if (eventSignupForm.event.status === EventStatusEnum.PAST_STATUS) {
        return data;
      }
      if (eventSignupForm.event.status != EventStatusEnum.APPROVED_STATUS) {
        throw new NotFoundError('Event does not exists');
      }

      return data;
    } catch (err: any) {
      throw err;
    }
  }

  public static async create(
    eventId: string,
    body: CreateSignupFormDto,
  ): Promise<SignupFormsResponse> {
    try {
      const event: Event | undefined = await Event.findOne({
        where: { id: eventId },
        relations: { owner: true },
      });
      if (!event) {
        throw new NotFoundError('Event');
      }
      let random = Math.floor(100000 + Math.random() * 900000).toString();

      const companyName = (event.owner?.additionalHostInformation?.companyName || '')
        .split(' ')
        .join('');
      const signupForm = new EventSignupForms();
      signupForm.hasAccessForAdditionalGuests = body.hasAccessForAdditionalGuests;
      signupForm.description = body.description;
      signupForm.name = body.name || `${companyName} 's`;
      signupForm.styling = body.styling;
      signupForm.urlCode = random;
      signupForm.isPublished = true;
      signupForm.createdBy = { id: body.userId } as User;
      signupForm.event = { id: eventId } as Event;
      signupForm.questionIds = [];
      await signupForm.save();

      const questionList: SignupFormQuestions[] = [];
      let index = 0;
      for (let q of body.questions) {
        index++;
        const question = new SignupFormQuestions();
        question.name = q.name;
        question.isDefault = q.id ? true : false;
        question.value = q.value;
        question.isRequired = q.isRequired;
        question.hasToggle = q.hasToggle || false;
        question.isToggled = q.isToggled || false;
        question.ordering = index;
        question.signupForms = { id: signupForm.id } as EventSignupForms;

        questionList.push(question);
      }
      const savedQuestions = SignupFormQuestions.create(questionList);
      await SignupFormQuestions.insert(savedQuestions);
      signupForm.questionIds = savedQuestions.map(q => q.id);
      await signupForm.save();
      const baseUrl: string = config.get('SIGNUP_FORM_BASE_URL') || '';
      const response = buildSignupFormsResponse(event, signupForm, baseUrl, 0);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Updates a signup form and its questions.
   * - Handles form metadata update
   * - Creates, updates, or deletes questions
   */
  public static async update(
    id: string,
    eventId: string,
    body: CreateSignupFormDto,
  ): Promise<SignupFormsResponse> {
    const signupForm: EventSignupForms | undefined = await EventSignupForms.findOne({
      where: { id: id, event: { id: eventId } },
      relations: { event: true, createdBy: true },
    });
    if (!signupForm) {
      throw new ForbiddenError('Signup Forms does not exists.');
    }

    // Step 1: Collect old question IDs from the incoming body
    const oldQuestionIds: string[] = [];
    body.questions.forEach(q => q.id && oldQuestionIds.push(q.id));
    // const oldQuestions: FindOperator<string> = In(oldQuestionIds);
    // const questonList = await SignupFormQuestions.find({
    //   where: { id: oldQuestions },
    // });

    // Step 2: Fetch existing questions to check if any are default/static
    const existingQuestions = await SignupFormQuestions.getRepository()
      .createQueryBuilder()
      .where('id IN (:...ids)', { ids: oldQuestionIds })
      .getMany();

    const questionsMap = new Map<string, boolean>();
    existingQuestions.forEach(q => questionsMap.set(q.id.toString(), q.isDefault));

    // Step 3: Update signup form meta
    signupForm.hasAccessForAdditionalGuests = body.hasAccessForAdditionalGuests;
    signupForm.description = body.description;
    signupForm.styling = body.styling;
    signupForm.isPublished = true;
    signupForm.isActive = true;
    signupForm.name = body.name;

    const ids = new Set<string>(); // To hold unique question IDs
    const questionPromises: any[] = [];

    /**---------TO DO:: HACKY FIX --------------------- */
    if (!body.hasAccessForAdditionalGuests) {
      const guestsWithStaticQuestions = await SignupFormQuestions.find({
        where: { signupForms: { id: id } },
      });
      const hasAccessForAdditionalGuests = guestsWithStaticQuestions.find(
        g => g.name === 'Request Access for Additional Guests',
      );
      if (hasAccessForAdditionalGuests) {
        const deleteQuestions = SignupFormQuestions.delete(hasAccessForAdditionalGuests.id);
        questionPromises.push(deleteQuestions);
      }
    }

    const questionList: SignupFormQuestions[] = [];
    let index = 0;
    for (let q of body.questions) {
      index++;
      const question = new SignupFormQuestions();
      const isStatic = questionsMap.get(q.id) || false;
      if (!isStatic) {
        question.name = q.name;
        question.isRequired = q.isRequired;
        switch (q.action.toLowerCase()) {
          case 'create':
            question.ordering = index;
            question.signupForms = { id: id } as EventSignupForms;
            questionList.push(question);
            break;
          case 'update':
            ids.add(q.id!);
            question.ordering = index;
            const updatesQuestion = SignupFormQuestions.update(q.id, question);
            questionPromises.push(updatesQuestion);
            break;
          case 'delete':
            const deleteQuestions = SignupFormQuestions.delete(q.id);
            questionPromises.push(deleteQuestions);
            break;
        }
      } else {
        ids.add(q.id!);
        question.ordering = index;
        question.value = q.value;
        question.hasToggle = q.hasToggle || false;
        question.isToggled = q.isToggled || false;
        const updatesQuestion = SignupFormQuestions.update(q.id, question);
        questionPromises.push(updatesQuestion);
      }
    }

    // Step 4: Insert new questions
    await Promise.all(questionPromises);
    const newQuestions = SignupFormQuestions.create(questionList);
    await SignupFormQuestions.insert(newQuestions);
    newQuestions.forEach(q => ids.add(q.id!));
    signupForm.questionIds = Array.from(ids);

    // Step 5: Save form and return response
    const baseUrl: string = config.get('SIGNUP_FORM_BASE_URL') || '';
    await signupForm.save();
    const response = buildSignupFormsResponse(signupForm.event, signupForm, baseUrl, 0);
    return response;
  }

  private static extractUserPayloadAndAnswers(
    requestPayload: SignupFormAnswersDto[],
    answerList: SignupFormAnswersDto[],
    userPayload: User,
    requestedGuests: any,
  ) {
    requestPayload.forEach((ans: SignupFormAnswersDto) => {
      const answer = new SignupFormAnswersDto();
      answer.answers = ans.answers || '';
      answer.id = ans.id;
      answer.isRequired = ans.isRequired;
      answer.name = ans.name;
      if (ans.isRequired) {
        switch (answer.name.toLowerCase()) {
          case 'first name':
            userPayload.firstName = ans.answers;
            break;
          case 'last name':
            userPayload.lastName = ans.answers;
            break;
          case 'email':
            userPayload.email = ans.answers.trim().toLowerCase();
            if (!isValidEmail(userPayload.email)) {
              throw new BadRequestError('Invalid Email format');
            }
            break;
          case 'phone':
            userPayload.phoneNumber = ans.answers;
            if (!isValidPhoneNumber(userPayload.phoneNumber)) {
              throw new BadRequestError('Invalid Phone Number format');
            }
            break;
          case 'request access for additional guests':
            requestedGuests.additional = Number(ans.answers);
            break;

          case 'instagram':
            userPayload.instagramUserName = ans.answers.trim();
            break;
        }
      }
      answerList.push(answer);
    });
  }

  private static async registerUserAsNonMember(payload: User, queryRunner: QueryRunner) {
    await queryRunner.manager.save(payload);

    const nonMemberRole: Role[] = await this.dbConnection
      .getRepository(Role)
      .find({ where: { name: 'non_member' } });

    const userRole = UserRole.create({
      role: { id: nonMemberRole[0].id },
      source: UserSourceEnum.SIGN_UP_FORM,
      user: { id: payload.id },
    });

    await queryRunner.manager.save(userRole);
  }

  private static async assignRoleToUser(payload: User, queryRunner: QueryRunner) {
    const nonMemberRole: Role[] = await this.dbConnection
      .getRepository(Role)
      .find({ where: { name: 'non_member' } });

    const userRole = UserRole.create({
      role: { id: nonMemberRole[0].id },
      source: UserSourceEnum.SIGN_UP_FORM,
      user: { id: payload.id },
    });

    await queryRunner.manager.save(userRole);
  }

  private static async validateUserAsGuest(
    eventId: string,
    userPayload: User,
  ): Promise<[User, Guest]> {
    let user = null;
    if (!userPayload.email && !userPayload.phoneNumber) {
      throw new BadRequestError('User information missing to apply for an event.');
    }
    if (userPayload.email) {
      user = await User.findOne({
        where: { email: userPayload.email },
      });
    }
    if (userPayload.phoneNumber && !user) {
      user = await User.findOne({
        where: { phoneNumber: userPayload.phoneNumber },
      });
    }
    if (!user) {
      return [userPayload, new Guest()];
    }
    if (user.id) {
      const guest = await Guest.findOne({
        where: { user: { id: user.id }, event: { id: eventId } },
      });
      if (guest) {
        if (guest.status !== GuestStatus.DRAFT) {
          throw new ForbiddenError(
            'You are already part of this event. Please log into application and check your event status.',
          );
        }
        return [user, guest];
      }
    }
    return [user, new Guest()];
  }

  public static async validateGuestExistence(userPayload: EventGuestRequest): Promise<string> {
    let userFoundWithEmail = null;
    let userFoundWithPhone = null;
    if (userPayload?.email) {
      userFoundWithEmail = await User.findOne({
        where: { email: userPayload.email.trim().toLowerCase() },
      });
    }
    if (userPayload?.phoneNumber) {
      userFoundWithPhone = await User.findOne({
        where: { phoneNumber: userPayload.phoneNumber },
      });
    }
    if (!userPayload || (!userPayload.email && !userPayload.phoneNumber)) {
      throw new BadRequestError('User information (email or phone) is required.');
    }
    if (userFoundWithEmail?.id) {
      const guest = await Guest.findOne({
        where: { user: { id: userFoundWithEmail.id }, event: { id: userPayload.id } },
      });
      if (guest && guest.status !== GuestStatus.DRAFT) {
        throw new ForbiddenError(
          'This email address is already associated with a status on the guest list.',
        );
      }
    }
    if (userFoundWithPhone?.id) {
      const guest = await Guest.findOne({
        where: { user: { id: userFoundWithPhone.id }, event: { id: userPayload.id } },
      });
      if (guest && guest.status !== GuestStatus.DRAFT) {
        throw new ForbiddenError(
          'This phone number is already associated with a status on the guest list.',
        );
      }
    }
    return '';
  }

  public static async answers(id: string, eventId: string, payload: SignupFormAnswersDto[]) {
    try {
      const signupForm: EventSignupForms | undefined = await EventSignupForms.findOne({
        where: { id: id, event: { id: eventId } },
        relations: { event: { owner: true } },
      });
      if (!signupForm) {
        throw new ForbiddenError('Signup Forms');
      }

      if (!signupForm.event) {
        throw new ForbiddenError('Event does not exists.');
      }

      // Step 5: Ensure invites can only be sent for approved events
      if (signupForm.event.status !== EventStatusEnum.APPROVED_STATUS) {
        throw new ForbiddenError('You can apply only for approved event.');
      }
      let userPayload = new User();
      const answerList: SignupFormAnswersDto[] = [];
      let requestedGuests: any = { additional: 0 };

      this.extractUserPayloadAndAnswers(payload, answerList, userPayload, requestedGuests);
      let inviteGuestPayload = null;
      [userPayload, inviteGuestPayload] = await this.validateUserAsGuest(eventId, userPayload);
      if (signupForm.event.owner.id === userPayload?.id) {
        throw new ValidationError('Host cannot apply to their own event.');
      }
      const queryRunner: QueryRunner = database.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      if (!userPayload.id) {
        await this.registerUserAsNonMember(userPayload, queryRunner);
      }

      const isMemberOrNonMember = userPayload.roles.some(userRole =>
        ['member', 'non_member'].includes(userRole.role.name),
      );
      if (!isMemberOrNonMember) {
        await this.assignRoleToUser(userPayload, queryRunner);
      }

      /**--Create Submissions */
      const submissions = new SignupFormSubmissions();
      submissions.signupForm = { id: id } as EventSignupForms;
      submissions.answers = answerList;
      submissions.attendees = { id: userPayload.id } as User;
      await queryRunner.manager.save(submissions);

      /**-- Create Guest */
      inviteGuestPayload.event = signupForm.event;
      inviteGuestPayload.additionalRequestedGuests = requestedGuests.additional;
      inviteGuestPayload.maxAdditionalGuests = requestedGuests.additional;
      inviteGuestPayload.user = { id: userPayload.id } as User;
      inviteGuestPayload.invitationSource = UserSource.SIGN_UP_FORM;
      inviteGuestPayload.ticketType = undefined;
      inviteGuestPayload.status = GuestStatus.APPLIED;
      inviteGuestPayload.signupFormSubmissions = {
        id: submissions.id,
      } as SignupFormSubmissions;
      await queryRunner.manager.save(inviteGuestPayload);

      submissions.guestId = inviteGuestPayload.id;
      await queryRunner.manager.save(submissions);

      /**-- Create Host User Mapping */
      const existingMapping = await HostUserMapping.findOne({
        where: {
          user: { id: userPayload.id },
          host: { id: signupForm.event.owner.id },
        },
      });
      if (!existingMapping) {
        const hostUserMapping = new HostUserMapping();
        hostUserMapping.user = { id: userPayload.id } as User;
        hostUserMapping.host = { id: signupForm.event.owner.id } as User;
        await queryRunner.manager.save(hostUserMapping);
      }

      await queryRunner.commitTransaction();

      try {
        // Send Notification
        serviceMesh
          .notificationService()
          .sendNotification(
            NotificationType.RSVP_SIGNUP_FORM_REQUEST,
            signupForm.event.owner.id,
            signupForm.event.id,
            userPayload.id,
          );
      } catch (error) {
        console.log('🚀 ~ SignupFormsServices ~ error:', error);
      }
      if (userPayload?.phoneNumber) {
        try {
          const validateNumber = isValidPhoneNumber(userPayload.phoneNumber);
          if (validateNumber) {
            const cleanedNumber = userPayload.phoneNumber.replace(/[\s\-()]/g, '').trim();
            const link = `${config.get('RUMOR_WEBSITE_HOST') + 'redirect'}`;
            let message = `Thanks for your request for ${signupForm?.event?.name || 'Event'}. Download Rumor to apply to join our community and discover other experiences. ${link}.`;
            await serviceMesh.notificationService().sendTextMessage(cleanedNumber, message);
          }
        } catch (err) {}
      }

      return submissions;
    } catch (err) {
      throw err;
    }
  }

  /**
   * 1. When an event is cancelled, need to deactivate Signup Forms.
   * @param id
   */
  public static async deactivate(id: string, hostId: string) {
    const signupForm = await EventSignupForms.findOne({
      where: { id: id, createdBy: { id: hostId } },
    });

    if (!signupForm) {
      throw new ForbiddenError('SignupForm does not exists');
    }

    const data: UpdateResult = await EventSignupForms.update(id, {
      isPublished: false,
      isActive: false,
    });
    return data;
  }

  /**
   * Situation 1: Event is Active and SF is created -> PUBLISHED and ACTIVE
   * Situation 2: Event is passed and SF was Update -> RSVP CLOSED
   * Timezone not coming up get signup forms.
   * Collaborators data is not showing up email, role, name and profile.
   * Only approved Collaborator which is Host will be shown.
   * Host profile pictures.
   */

  public static async listSubmissionsWithPerformanceOptimisations(id: string, payload: any) {
    try {
      const parsedQuery = parse(payload);
      const take = parsedQuery?.take ? parseInt(parsedQuery.take as string) : undefined;
      const lastIndex =
        parsedQuery?.lastIndex && isUUID(parsedQuery.lastIndex) ? parsedQuery.lastIndex : undefined;

      const searchValue =
        parsedQuery.findByName && typeof parsedQuery.findByName === 'string'
          ? parsedQuery.findByName.toLowerCase()
          : '';

      const submissionsQuery = database
        .getRepository(SignupFormSubmissions)
        .createQueryBuilder('sfs')
        .innerJoin('sfs.attendees', 'atd')
        .innerJoin('sfs.guest', 'gst')
        .select([])
        .addSelect('sfs.id', 'id')
        .addSelect('atd.firstName', 'firstName')
        .addSelect('atd.lastName', 'lastName')
        .addSelect('atd.email', 'email')
        .addSelect('atd.phone_number', 'phone')
        .addSelect('gst.status', 'status')
        .addSelect('gst.guest_id', 'guestId')
        .addSelect('gst.user_id', 'userId')
        .where('sfs.signup_form_id = :signupFormId', { signupFormId: id });

      if (lastIndex && isUUID(lastIndex)) {
        submissionsQuery.andWhere('sfs.id < :id', {
          id: lastIndex,
        });
      }
      submissionsQuery.orderBy('sfs.id', 'DESC').limit(take);

      if (searchValue) {
        const searchWords = searchValue.trim().split(/\s+/);
        submissionsQuery.andWhere(
          new Brackets(qb => {
            searchWords.forEach(word => {
              qb.orWhere('atd.firstName ILIKE :word', {
                word: `%${word}%`,
              }).orWhere('atd.lastName ILIKE :word', { word: `%${word}%` });
            });
          }),
        );
      }

      const count = await SignupFormSubmissions.count();
      const submissionList = await submissionsQuery.getRawMany();
      const result = { count, result: submissionList };
      return result;
    } catch (err) {
      throw err;
    }
  }

  public static async listSubmissions(id: string, hostId: string, payload: any) {
    try {
      const signupForm = await EventSignupForms.findOne({
        where: { id: id, createdBy: { id: hostId } },
      });

      if (!signupForm) {
        throw new ForbiddenError('SignupForm does not exists');
      }

      const parsedQuery = parse(payload);
      const take = parsedQuery?.take ? parseInt(parsedQuery.take as string) : undefined;

      const skip = parsedQuery?.skip ? parseInt(parsedQuery.skip as string) : undefined;

      const searchValue =
        parsedQuery.findByName && typeof parsedQuery.findByName === 'string'
          ? parsedQuery.findByName.toLowerCase()
          : '';

      // const count = await SignupFormSubmissions.count({
      //   where: {
      //     signupForm: { id: id },
      //   },
      // });

      const getCountQuery = database
        .getRepository(SignupFormSubmissions)
        .createQueryBuilder('sfs')
        .innerJoin('sfs.attendees', 'atd')
        .where('sfs.signup_form_id = :signupFormId', { signupFormId: id });

      const submissionsQuery = database
        .getRepository(SignupFormSubmissions)
        .createQueryBuilder('sfs')
        .innerJoin('sfs.attendees', 'atd')
        .innerJoin('sfs.guest', 'gst')
        .select([])
        .addSelect('sfs.id', 'id')
        .addSelect('sfs.answers', 'answers')
        .addSelect('atd.firstName', 'firstName')
        .addSelect('atd.profilePicture', 'profilePicture')
        .addSelect('atd.lastName', 'lastName')
        .addSelect('atd.email', 'email')
        .addSelect('atd.phone_number', 'phone')
        .addSelect('gst.status', 'status')
        .addSelect('gst.id', 'guestId')
        .addSelect('gst.user_id', 'userId')
        .addSelect('gst.maxAdditionalGuests + 1', 'partySize')
        .where('sfs.signup_form_id = :signupFormId', { signupFormId: id });
      if (searchValue) {
        const searchWords = searchValue.trim().split(/\s+/);
        getCountQuery.andWhere(
          new Brackets(qb => {
            searchWords.forEach(word => {
              qb.orWhere('atd.firstName ILIKE :word', {
                word: `%${word}%`,
              }).orWhere('atd.lastName ILIKE :word', { word: `%${word}%` });
            });
          }),
        );
        submissionsQuery.andWhere(
          new Brackets(qb => {
            searchWords.forEach(word => {
              qb.orWhere('atd.firstName ILIKE :word', {
                word: `%${word}%`,
              }).orWhere('atd.lastName ILIKE :word', { word: `%${word}%` });
            });
          }),
        );
      }
      if (parsedQuery.sortBy === 'name') {
        const sortDirection = parsedQuery.sortDirection === 'DESC' ? 'DESC' : 'ASC';
        submissionsQuery
          .addOrderBy('atd.firstName', sortDirection)
          .addOrderBy('atd.lastName', sortDirection)
          .offset(skip)
          .limit(take);
      } else {
        submissionsQuery.orderBy('sfs.id', 'DESC').offset(skip).limit(take);
      }

      const count = await getCountQuery.getCount();
      const submissionList = await submissionsQuery.getRawMany();
      const result = { count, result: submissionList };
      return result;
    } catch (err) {
      throw err;
    }
  }

  // public static async setName(id: string, name: string) {
  //   try {
  //     const signupForm: EventSignupForms = await EventSignupForms.findOne({
  //       where: { id: id },
  //     });
  //     if (!signupForm) {
  //       throw new ForbiddenError("Signup Forms does not exists.");
  //     }
  //     signupForm.name = name;
  //     await signupForm.save();
  //   } catch (err) {
  //     throw err;
  //   }
  // }
}
