import { Event } from "../entities";
import { EventSignupForms } from "../entities/event-signup-forms.entity";
import { SignupFormQuestions } from "../entities/signup-form-questions.entity";
import { SignupFormsResponse } from "../grpc/events/general.pb";

export const buildSignupFormsResponse = (
  event: Event,
  esf: EventSignupForms,
  submissions: number = 0
): SignupFormsResponse => {
  const result: SignupFormsResponse = {
    id: esf.id,
    name: event.name,
    startDate: event.startDate.toString() || new Date().toString(),
    address: event.location,
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
    url: `/${event.owner.firstName}/${event.name}/${esf.urlCode}`,
    questions: esf.questions && esf.questions.map((q) => buildQuestion(q)) || [],
    hasAccessForAdditionalGuests: esf.hasAccessForAdditionalGuests,
  };
  return result;
};

const buildQuestion = (q: SignupFormQuestions) => {
  return {
    id: q.id,
    isRequired: q.isRequired,
    isDefault: q.isDefault,
    name: q.name,
    ordering: q.ordering,
  };
};
