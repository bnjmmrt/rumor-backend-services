import {
  SignupFormsResponse,
  UserSource,
} from "rumor-utils/shared/events/grpc/events/general.pb";
import { buildSignupFormsResponse } from "rumor-utils/shared/events/mappers/signup-forms.mapper";
import { SignupFormStaticQuestions } from "rumor-utils/shared/events/entities/signup-form-static-questions.entity";
import {
  Event,
  EventSignupForms,
  SignupFormQuestions,
  SignupFormSubmissions,
  User,
  UserRole,
  Role,
  Guest,
} from "rumor-utils/shared/entities";
import { ForbiddenError, NotFoundError } from "rumor-utils/errors";
import database from "../database";
import {
  CreateSignupFormDto,
  SignupFormAnswersDto,
} from "rumor-utils/shared/events/dtos/signup-forms.dto";
import { parse } from "qs";
import { Brackets, DataSource, In } from "typeorm";
import { isUUID } from "class-validator";
import { EventStatusEnum } from "rumor-utils/shared/events/interfaces/event.interface";

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
      },
    });
    return staticQuestions;
  }

  public static async get(
    id: string,
    eventId: string
  ): Promise<SignupFormsResponse> {
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
      throw new NotFoundError("Event");
    }
    const signupForm: EventSignupForms = await EventSignupForms.findOne({
      where: { id: id, event: { id: eventId } },
      relations: { createdBy: true, questions: true },
    });

    const data = buildSignupFormsResponse(
      event,
      signupForm,
      "https://dev.therumor.com"
    );
    return data;
  }

  public static async getByEventId(
    eventId: string
  ): Promise<SignupFormsResponse[]> {
    try {
      const event: Event | undefined = await Event.findOne({
        where: { id: eventId },
        relations: { owner: true },
      });
      if (!event) {
        throw new NotFoundError("Event not found");
      }
      const signupForms = await EventSignupForms.find({
        where: { event: { id: eventId } },
        relations: { submissions: true, createdBy: true },
      });

      const resultList: SignupFormsResponse[] = [];

      signupForms.forEach((sf) =>
        resultList.push(
          buildSignupFormsResponse(
            event,
            sf,
            "https://dev.therumor.com",
            sf.submissions.length
          )
        )
      );
      return resultList;
    } catch (err) {
      throw err;
    }
  }

  public static async getByUrl(code: string) {
    try {
      const eventSignupForm: EventSignupForms | undefined =
        await EventSignupForms.findOne({
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
        throw new ForbiddenError("SignupForm does not exists");
      }

      const data = buildSignupFormsResponse(
        eventSignupForm.event,
        eventSignupForm,
        "https://dev.therumor.com"
      );

      return data;
    } catch (err: any) {
      throw err;
    }
  }

  public static async create(
    eventId: string,
    body: CreateSignupFormDto
  ): Promise<SignupFormsResponse> {
    try {
      const event: Event | undefined = await Event.findOne({
        where: { id: eventId },
        relations: { owner: true },
      });
      if (!event) {
        throw new NotFoundError("Event");
      }
      if (!event.isPublished) {
        throw new ForbiddenError("This event is not published.");
      }
      if (event.isPrivate) {
        throw new ForbiddenError(
          "You cannot create signup forms for private events."
        );
      }
      let random = (Math.random() + 1).toString(6).substring(6);

      const signupForm = new EventSignupForms();
      signupForm.hasAccessForAdditionalGuests =
        body.hasAccessForAdditionalGuests;
      signupForm.description = body.description;
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
        question.isRequired = q.isRequired;
        question.ordering = index;
        question.signupForms = { id: signupForm.id } as EventSignupForms;

        questionList.push(question);
      }
      const savedQuestions = SignupFormQuestions.create(questionList);
      await SignupFormQuestions.insert(savedQuestions);
      signupForm.questionIds = savedQuestions.map((q) => q.id);
      await signupForm.save();
      const response = buildSignupFormsResponse(
        event,
        signupForm,
        "https://dev.therumor.com",
        0
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public static async update(
    id: string,
    eventId: string,
    body: CreateSignupFormDto
  ): Promise<SignupFormsResponse> {
    const signupForm: EventSignupForms | undefined =
      await EventSignupForms.findOne({
        where: { id: id, event: { id: eventId } },
        relations: { event: true, createdBy: true },
      });
    if (!signupForm) {
      throw new ForbiddenError("Signup Forms does not exists.");
    }

    const oldQuestionids = [];
    body.questions.forEach((q) => q.id && oldQuestionids.push(q.id));

    const questonList = await SignupFormQuestions.find({
      where: { id: In(oldQuestionids) },
    });
    const questionsMap = new Map<string, boolean>();
    questonList.forEach((q) => questionsMap.set(q.id.toString(), q.isDefault));

    signupForm.hasAccessForAdditionalGuests = body.hasAccessForAdditionalGuests;
    signupForm.description = body.description;
    signupForm.styling = body.styling;

    const ids = [];
    const questionPromises: any[] = [];
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
          case "create":
            question.ordering = index;
            question.signupForms = { id: id } as EventSignupForms;
            questionList.push(question);
            break;
          case "update":
            ids.push(q.id);
            question.ordering = index;
            const updatesQuestion = SignupFormQuestions.update(q.id, question);
            questionPromises.push(updatesQuestion);
            break;
          case "delete":
            const deleteQuestions = SignupFormQuestions.delete(q.id);
            questionPromises.push(deleteQuestions);
            break;
        }
      } else {
        ids.push(q.id);
        question.ordering = index;
        const updatesQuestion = SignupFormQuestions.update(q.id, question);
        questionPromises.push(updatesQuestion);
      }
    }
    await Promise.all(questionPromises);
    const newQuestions = SignupFormQuestions.create(questionList);
    await SignupFormQuestions.insert(newQuestions);
    ids.push(...newQuestions.map((q) => q.id));
    signupForm.questionIds = ids;
    await signupForm.save();
    const response = buildSignupFormsResponse(
      signupForm.event,
      signupForm,
      "https://dev.therumor.com",
      0
    );
    return response;
  }

  private static extractUserPayloadAndAnswers(
    requestPayload: SignupFormAnswersDto[],
    answerList: SignupFormAnswersDto[],
    userPayload: User,
    requestedGuests: number = 0
  ) {
    requestPayload.forEach((ans: SignupFormAnswersDto) => {
      const answer = new SignupFormAnswersDto();
      answer.answers = ans.answers || "";
      answer.id = ans.id;
      answer.isRequired = ans.isRequired;
      answer.name = ans.name;
      if (ans.isRequired) {
        switch (answer.name.toLowerCase()) {
          case "first name":
            userPayload.firstName = ans.answers;
            break;
          case "last name":
            userPayload.lastName = ans.answers;
            break;
          case "email":
            userPayload.email = ans.answers;
            break;
          case "phone":
            userPayload.phoneNumber = ans.answers;
            break;
          case "request access for additional guests":
            requestedGuests = Number(ans.answers);
            break;
        }
      }
      answerList.push(answer);
    });
  }

  public static async answers(
    id: string,
    eventId: string,
    payload: SignupFormAnswersDto[]
  ) {
    try {
      const signupForm: EventSignupForms | undefined =
        await EventSignupForms.findOne({
          where: { id: id, event: { id: eventId } },
          relations: { event: true },
        });
      if (!signupForm) {
        throw new ForbiddenError("Signup Forms");
      }

      if (!signupForm.event) {
        throw new ForbiddenError("Event does not exists.");
      }

      // Step 5: Ensure invites can only be sent for approved events
      if (signupForm.event.status !== EventStatusEnum.APPROVED_STATUS) {
        throw new ForbiddenError(
          "You cannot send invites until the event has been approved by the Rumor admin"
        );
      }
      const userPayload = new User();
      const answerList: SignupFormAnswersDto[] = [];
      let requestedGuests: number = 0;
      // payload.forEach((ans: SignupFormAnswersDto) => {
      //   const answer = new SignupFormAnswersDto();
      //   answer.answers = ans.answers || "";
      //   answer.id = ans.id;
      //   answer.isRequired = ans.isRequired;
      //   answer.name = ans.name;
      //   if (ans.isRequired) {
      //     switch (answer.name.toLowerCase()) {
      //       case "first name":
      //         userPayload.firstName = ans.answers;
      //         break;
      //       case "last name":
      //         userPayload.lastName = ans.answers;
      //         break;
      //       case "email":
      //         userPayload.email = ans.answers;
      //         break;
      //       case "phone":
      //         userPayload.phoneNumber = ans.answers;
      //         break;
      //       case "request access for additional guests":
      //         requestedGuests = ans.answers;
      //         break;
      //     }
      //   }
      //   answerList.push(answer);
      // });

      this.extractUserPayloadAndAnswers(
        payload,
        answerList,
        userPayload,
        requestedGuests
      );

      const queryRunner = database.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await queryRunner.manager.save(userPayload);
      //await userPayload.save();

      const nonMemberRole: Role[] = await this.dbConnection
        .getRepository(Role)
        .find({ where: { name: "non_member" } });

      // const userRole = await UserRole.create({
      //   role: { id: nonMemberRole[0].id },
      //   user: { id: userPayload.id },
      // }).save();

      const userRole = UserRole.create({
        role: { id: nonMemberRole[0].id },
        user: { id: userPayload.id },
      });
      await queryRunner.manager.save(userRole);

      const inviteGuestPayload = new Guest();
      inviteGuestPayload.event = signupForm.event;
      inviteGuestPayload.maxAdditionalGuests = requestedGuests;
      inviteGuestPayload.user = { id: userPayload.id } as User;
      inviteGuestPayload.invitationSource = UserSource.INVITED_BY_HOST;
      inviteGuestPayload.ticketType = undefined;
      // inviteGuestPayload.status = GuestStatus.APPLIED;
      // await inviteGuestPayload.save();
      await queryRunner.manager.save(inviteGuestPayload);

      const submissions = new SignupFormSubmissions();
      submissions.signupForm = { id: id } as EventSignupForms;
      submissions.answers = answerList;
      submissions.guest = { id: inviteGuestPayload.id } as Guest;
      submissions.attendees = { id: userPayload.id } as User;

      // await submissions.save();
      await queryRunner.manager.save(submissions);
      await queryRunner.commitTransaction();
      return submissions;
    } catch (err) {
      throw err;
    }
  }

  /**
   * 1. When an event is cancelled, need to deactivate Signup Forms.
   * @param id
   */
  public static async deactivate(id: string) {
    await EventSignupForms.update(id, { isPublished: false, isActive: false });
  }

  /**
   * Situation 1: Event is Active and SF is created -> PUBLISHED and ACTIVE
   * Situation 2: Event is passed and SF was Update -> RSVP CLOSED
   * Timezone not coming up get signup forms.
   * Collaborators data is not showing up email, role, name and profile.
   * Only approved Collaborator which is Host will be shown.
   * Host profile pictures.
   */

  // private static generateSubmissionQuery(skip: number, take: number, ) {
  //   const submissionsQuery = SignupFormSubmissions.createQueryBuilder("sfs")
  //     .innerJoinAndSelect("sfs.attendees", "atd")
  //     .innerJoinAndSelect("sfs.guest", "gst")
  //     .orderBy("sfs.id", "DESC")
  //     .addSelect("sfs.id", "id")
  //     .addSelect("atd.firstName", "firstName")
  //     .addSelect("atd.lastName", "lastName")
  //     .addSelect("atd.email", "email")
  //     .addSelect("atd.phone", "phone")
  //     .addSelect("gst.status", "status")
  //     .where("sfs.signup_form_id = :id", { signupFormId: id })
  //     .skip(skip)
  //     .take(take);

  //   if (parsedQuery.lastIndex && isUUID(parsedQuery.lastIndex)) {
  //     submissionsQuery.andWhere("sfs.id > :id", { id: parsedQuery.lastIndex });
  //   }

  //   if (searchValue) {
  //     const searchWords = searchValue.trim().split(/\s+/);
  //     submissionsQuery.andWhere(
  //       new Brackets((qb) => {
  //         searchWords.forEach((word) => {
  //           qb.orWhere("atd.firstName ILIKE :word", {
  //             word: `%${word}%`,
  //           }).orWhere("atd.lastName ILIKE :word", { word: `%${word}%` });
  //         });
  //       })
  //     );
  //   }
  // }

  public static async listSubmissions(id: string, payload: any) {
    try {
      const parsedQuery = parse(payload);
      const take = parsedQuery?.take
        ? parseInt(parsedQuery.take as string)
        : undefined;
      const skip = parsedQuery?.skip
        ? parseInt(parsedQuery.skip as string)
        : undefined;

      const searchValue =
        parsedQuery.findByName && typeof parsedQuery.findByName === "string"
          ? parsedQuery.findByName.toLowerCase()
          : "";

      //const submissionsQuery = SignupFormSubmissions.createQueryBuilder("sfs")
      const submissionsQuery = database
        .getRepository(SignupFormSubmissions)
        .createQueryBuilder("sfs")
        .innerJoin("sfs.attendees", "atd")
        .innerJoin("sfs.guest", "gst")
        .select([])
        .addSelect("sfs.id", "id")
        .addSelect("atd.firstName", "firstName")
        .addSelect("atd.lastName", "lastName")
        .addSelect("atd.email", "email")
        .addSelect("atd.phone_number", "phone")
        .addSelect("gst.status", "status")
        .where("sfs.signup_form_id = :signupFormId", { signupFormId: id })
        .orderBy("sfs.id", "DESC")
        .skip(skip)
        .take(take);

      if (searchValue) {
        const searchWords = searchValue.trim().split(/\s+/);
        submissionsQuery.andWhere(
          new Brackets((qb) => {
            searchWords.forEach((word) => {
              qb.orWhere("atd.firstName ILIKE :word", {
                word: `%${word}%`,
              }).orWhere("atd.lastName ILIKE :word", { word: `%${word}%` });
            });
          })
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
}
