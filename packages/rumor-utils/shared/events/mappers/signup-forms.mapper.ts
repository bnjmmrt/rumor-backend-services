import { Event } from "../entities";
import { EventSignupForms } from "../entities/event-signup-forms.entity";
import { SignupFormQuestions } from "../entities/signup-form-questions.entity";
import { SignupFormsResponse } from "../grpc/events/general.pb";

export const buildSignupFormsResponse = (
  event: Event,
  esf: EventSignupForms,
  baseUrl: string,
  submissions: number = 0
): SignupFormsResponse => {
  const companyName = (
    event.owner?.additionalHostInformation?.companyName || ""
  )
    .split(" ")
    .join("");
  const eventName = event.name.split(" ").join("");

  const result: SignupFormsResponse = {
    id: esf.id,
    name: event.name,
    startDate: event.startDate.toString() || new Date().toString(),
    endDate: event.endDate.toString() || new Date().toString(),
    address: event.location,
    timeZone: event.timeZone,
    type: event.eventType?.name,
    ageLimit: event.ageLimit,
    talents: event.talents,
    collaborators: event.collaborators,
    styling: esf.styling,
    userId: esf.createdBy.id,
    userName: `${esf.createdBy.firstName} ${esf.createdBy.lastName}`,
    userProfile: esf.createdBy.profilePicture,
    submissionCount: submissions,
    isActive: esf.isActive,
    isPublished: esf.isPublished,
    description: esf.description,
    url: `${baseUrl}/${companyName}/${eventName}/${esf.urlCode}`,
    questions:
      (esf.questions && esf.questions.map((q) => buildQuestion(q))) || [],
    hasAccessForAdditionalGuests: esf.hasAccessForAdditionalGuests,
    eventStatus: event.status
  };
  result.questions &&
    result.questions.sort((a, b) => {
      return a.ordering > b.ordering ? 1 : a.ordering == b.ordering ? 0 : -1;
    });
  return result;
};

const buildQuestion = (q: SignupFormQuestions) => {
  return {
    id: q.id,
    isRequired: q.isRequired,
    isDefault: q.isDefault,
    name: q.name,
    ordering: q.ordering,
    value: q.value
  };
};
