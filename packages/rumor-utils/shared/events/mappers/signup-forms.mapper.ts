import { Event } from "../entities";
import { EventSignupForms } from "../entities/event-signup-forms.entity";
import { SignupFormQuestions } from "../entities/signup-form-questions.entity";
import {
  CollaboratorsEvent,
  SignupFormsResponse,
} from "../grpc/events/general.pb";
import { groupCollaborators } from "./events.mapper";

export const buildSignupFormsResponse = (
  event: Event,
  esf: EventSignupForms,
  baseUrl: string,
  submissions: number = 0
): SignupFormsResponse => {
  const companyName: string = (
    event.owner?.additionalHostInformation?.companyName || ""
  )
    .split(" ")
    .join("");
  const eventName: string = event.name.split(" ").join("");
  const collaborators: CollaboratorsEvent[] = groupCollaborators(
    event?.collaborators
  );

  const result: SignupFormsResponse = {
    id: esf.id,
    name: esf.name,
    startDate: event.startDate ? event.startDate.toString() : null,
    endDate: event.endDate ? event.endDate.toString() : null,
    address: event.location,
    timeZone: event.timeZone,
    type: event.eventType?.name,
    ageLimit: event.ageLimit,
    talents: event.talents,
    collaborators: collaborators,
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
    eventStatus: event.status,
    eventName: event.name,
    eventId: event.id,
    limitOnePlus: event.limitOnePlus || 0
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
    value: q.value,
  };
};
