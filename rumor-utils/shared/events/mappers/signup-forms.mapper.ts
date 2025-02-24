import config from "../../../../apps/events/src/config";
import { Event } from "../entities";
import { EventSignupForms } from "../entities/event-signup-forms.entity";
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
    description: esf.description,
    url: `${config.get("")}/${event.owner}/${event.name}/${esf.urlCode}`,
    questions: esf.questions,
    hasAccessForAdditionalGuests: esf.hasAccessForAdditionalGuests,
  };
  return result;
};

export const buildSignupFormList = (
  event: Event,
  esf: EventSignupForms,
  submissions: number
): SignupFormsResponse => {
  const result: SignupFormsResponse = {
    id: esf.id,
    styling: esf.styling,
    name: event.name,
    submissionCount: submissions,
    isActive: esf.isActive,
    url: `${config.get("")}/${event.owner}/${event.name}/${esf.urlCode}`,
    userId: esf.createdBy.id,
    userName: `${esf.createdBy.firstName} ${esf.createdBy.lastName}`,
    userProfile: esf.createdBy.profilePicture,
    description: esf.description,
    hasAccessForAdditionalGuests: esf.hasAccessForAdditionalGuests,
    startDate: event.startDate.toString() || new Date().toString(),
    talents: [],
    collaborators: [],
    questions: [],
  };
  return result;
};
