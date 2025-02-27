import { SignupFormsResponse } from "rumor-utils/shared/events/grpc/events/general.pb";
import { buildSignupFormsResponse } from "rumor-utils/shared/events/mappers/signup-forms.mapper";
import { SignupFormStaticQuestions } from "rumor-utils/shared/events/entities/signup-form-static-questions.entity";
import {
  Event,
  EventSignupForms,
  SignupFormQuestions,
  SignupFormSubmissions,
  User,
} from "rumor-utils/shared/entities";
import { ForbiddenError, NotFoundError } from "rumor-utils/errors";
import { Role } from "rumor-utils/shared/users/entities/roles/role.entity";
import database from "../database";
import {
  CreateSignupFormDto,
  SignupFormAnswersDto,
} from "rumor-utils/shared/events/dtos/signup-forms.dto";
export class SignupFormsServices {
  public static dbConnection = database;

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

    const data = buildSignupFormsResponse(event, signupForm);

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
        throw "Event not found";
      }
      const signupForms = await EventSignupForms.find({
        where: { event: { id: eventId } },
        relations: { submissions: true, createdBy: true },
      });

      const resultList: SignupFormsResponse[] = [];

      signupForms.forEach((sf) =>
        resultList.push(
          buildSignupFormsResponse(event, sf, sf.submissions.length)
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
        throw "SignupForm does not exists";
      }

      const data = buildSignupFormsResponse(
        eventSignupForm.event,
        eventSignupForm
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
        throw new ForbiddenError("");
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
      const response = buildSignupFormsResponse(event, signupForm, 0);
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
        relations: { event: true },
      });
    if (!signupForm) {
      throw new ForbiddenError("Signup Forms");
    }

    signupForm.hasAccessForAdditionalGuests = body.hasAccessForAdditionalGuests;
    signupForm.description = body.description;
    signupForm.styling = body.styling;

    const questionPromises: any[] = [];
    const questionList: SignupFormQuestions[] = [];
    let index = 0;
    for (let q of body.questions) {
      index++;
      const question = new SignupFormQuestions();
      question.name = q.name;
      question.isDefault = false;
      question.isRequired = q.isRequired;
      question.ordering = index;
      question.signupForms = { id: id } as EventSignupForms;

      switch (q.type.toLowerCase()) {
        case "create":
          questionList.push(question);
          break;
        case "update":
          const updatesQuestion = SignupFormQuestions.update(q.id, question);
          questionPromises.push(updatesQuestion);
          break;
        case "delete":
          const deleteQuestions = SignupFormQuestions.delete(q.id);
          questionPromises.push(deleteQuestions);
          break;
      }
    }
    await Promise.all(questionPromises);
    const newQuestions = SignupFormQuestions.create(questionList);
    await SignupFormQuestions.insert(newQuestions);
    const newQuestionIds = newQuestions.map((q) => q.id);
    signupForm.questionIds.push(...newQuestionIds);
    await signupForm.save();
    const response = buildSignupFormsResponse(signupForm.event, signupForm, 0);
    return response;
  }

  public static async answers(id: string, payload: SignupFormAnswersDto[]) {
    try {
      const userPayload = new User();
      const answerList: SignupFormAnswersDto[] = [];
      payload.forEach((ans: SignupFormAnswersDto) => {
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
          }
        }
      });

      const savedUser = await userPayload.save();
      const role: Role[] = await this.dbConnection
        .getRepository(Role)
        .find({ where: { name: "non_member" } });

      const submissions = new SignupFormSubmissions();
      submissions.signupForm = { id: id } as EventSignupForms;
      submissions.answers = answerList;
      submissions.attendees = { id: userPayload.id } as User;
      await submissions.save();
    } catch (err) {
      throw err;
    }
  }

  public static async deactivate(id: string) {
    await EventSignupForms.update(id, { isPublished: false });
  }
}
