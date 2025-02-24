import { SignupFormsResponse } from "rumor-utils/shared/events/grpc/events/general.pb";
import { buildSignupFormsResponse } from "rumor-utils/shared/events/mappers/signup-forms.mapper";
import { SignupFormStaticQuestions } from "rumor-utils/shared/events/entities/signup-form-static-questions.entity";
import { Event, EventSignupForms } from "rumor-utils/shared/entities";
import { errorHandler, NotFoundError } from "rumor-utils/errors";

export class SignupFormsServices {
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
      relations: { collaborators: true, ageLimit: true, talents: true },
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
      {
        const event: Event | undefined = await Event.findOne({
          where: { id: eventId },
          relations: { collaborators: true, ageLimit: true, talents: true },
        });
        if (!event) {
          throw "Event not found";
        }
        const signupForms = await EventSignupForms.find({
          where: { event: { id: eventId } },
          relations: { event: true, submissions: true },
        });

        const resultList: SignupFormsResponse[] = [];

        signupForms.forEach((sf) =>
          resultList.push(
            buildSignupFormsResponse(event, sf, sf.submissions.length)
          )
        );
        return resultList;
      }
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
            event: true,
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

  public static async create() {
    
  }
}
