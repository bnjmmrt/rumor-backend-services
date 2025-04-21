import * as express from 'express';
import { Router } from 'express';
import { EventAnnouncementController } from '../controllers/event-announcement.controller';
import { SignupFormsController } from '../controllers/signup-forms.controller';
import { GuestController } from '../controllers/guest.controller';
import AuthMiddleware from '../server/middleware/auth';
import { EventsController } from '../controllers/events.controller';
import { VouchRequestController } from '../controllers/vouch-request.controller';
import { QuizQuestionController } from '../controllers/quiz-question.controller';
import { TalentController } from '../controllers/talent.controller';
import { TicketTypeController } from '../controllers/ticket-type.controller';
import { CollaboratorController } from '../controllers/collaborator.controller';
import { AdmissionTypeController } from '../controllers/admission-type.controller';
import { FeaturedEventSectionsController } from '../controllers/featured-event-sections.controller';
import { validateRequest } from '../server/middleware/validate-request';
import { SponsorshipOpportunityController } from '../controllers/sponsorship-opportunity.controller';
import { SponsorshipCategoryController } from '../controllers/sponsorship-category.controller';
import { TargetSponsorController } from '../controllers/target-sponsor.controller';
import { CulturalMomentController } from '../controllers/cultural-moment.controller';
import { SponsorshipInquiryController } from '../controllers/sponsorship-inquiry.controller';

const router: Router = express.Router();

/**
 * Event Announcements------------------------------------------
 */

router.get(
  '/event/:eventId/event-announcement-guest',
  AuthMiddleware.fusionAuthRequired,
  EventAnnouncementController.getGuestListForAnnoucement,
);

router.get(
  '/event/:eventId/event-announcement-guest/:announcementId',
  AuthMiddleware.fusionAuthRequired,
  EventAnnouncementController.getRecipientListForAnnoucement,
);

router.post(
  '/event/:eventId/event-announcement',
  AuthMiddleware.fusionAuthRequired,
  validateRequest('eventAnnouncement'), //Validation in place
  EventAnnouncementController.postAnnouncement,
);

router.patch(
  '/event/:eventId/event-announcement/:announcementId',
  AuthMiddleware.fusionAuthRequired,
  validateRequest('eventAnnouncement'), //Validation in place
  EventAnnouncementController.updateAnnouncement,
);

router.get(
  '/event/:eventId/event-announcement/:announcementId',
  AuthMiddleware.fusionAuthRequired,
  EventAnnouncementController.getAnnouncement,
);

router.get(
  '/event/:eventId/event-announcements',
  AuthMiddleware.fusionAuth,
  EventAnnouncementController.getAnnouncements,
);

router.delete(
  '/event/:eventId/event-announcement/:announcementId',
  AuthMiddleware.fusionAuthRequired,
  EventAnnouncementController.deleteAnnouncement,
);

/**
 * Event Signup Forms------------------------------------------
 */

router.get(
  '/signup-forms/questions',
  AuthMiddleware.fusionAuthRequired,
  SignupFormsController.getStaticQuestions,
);
router.get(
  '/signup-forms/:id/questions',
  AuthMiddleware.fusionAuthRequired,
  SignupFormsController.getSignupFormQuestions,
);
router.get(
  '/events/:id/signup-forms',
  AuthMiddleware.fusionAuthRequired,
  SignupFormsController.getByEventId,
);
router.get(
  '/events/:eventId/signup-forms/:id',
  AuthMiddleware.fusionAuthRequired,
  SignupFormsController.get,
);
router.get('/signup-forms', SignupFormsController.getByUrl);

router.post(
  '/events/:id/signup-forms',
  AuthMiddleware.fusionAuthRequired,
  SignupFormsController.create,
);
router.put(
  '/events/:eventId/signup-forms/:id',
  AuthMiddleware.fusionAuthRequired,
  SignupFormsController.update,
);
router.post('/events/:eventId/signup-forms/:id/answers', SignupFormsController.submitAnswers);
router.patch(
  '/signup-forms/:id/deactivate',
  AuthMiddleware.fusionAuthRequired,
  SignupFormsController.deactivate,
);

router.get(
  '/signup-forms/:id/submissions',
  AuthMiddleware.fusionAuthRequired,
  SignupFormsController.listSubmissions,
);

router.get(
  '/signup-forms/:id/export',
  AuthMiddleware.fusionAuthRequired,
  SignupFormsController.exportCsv,
);

router.post('/signup-forms/check-guest-exists', SignupFormsController.checkIfGuestExists);

// router.patch(
//   "/signup-forms/:id/set-name",
//   AuthMiddleware.fusionAuthRequired,
//   SignupFormsController.setName
// );

// router.post(
//   "/events/:eventId/signup-forms/:id/publish",
//   (req: Request, res: Response) => {}
// );

//event types starts
router.post('/event-type', EventsController.createEventType); /**TestStatus: working */
router.put('/event-type/:id', EventsController.updateEventType); /**TestStatus: working */
router.get('/event-type/:id', EventsController.getEventType); /**TestStatus: working */
router.get('/event-types', EventsController.listEventTypes); /**TestStatus: working */
router.delete('/event-type/:id', EventsController.deleteEventType); /**TestStatus: working */

//Event age limit
router.post('/event-age-limit', EventsController.createEventAgeLimit); /**TestStatus: working */
router.put('/event-age-limit/:id', EventsController.updateEventAgeLimit); /**TestStatus: working */
router.get('/event-age-limit/:id', EventsController.getEventAgeLimit); /**TestStatus: working */
router.get('/event-age-limits', EventsController.listEventAgeLimits); /**TestStatus: working */
router.delete('/event-age-limit/:id', EventsController.deleteEventAgeLimit); /**TestStatus: */

//Event quiz questions
router.post('/quiz-question', QuizQuestionController.createQuizQuestion);
router.put('/quiz-question/:id', QuizQuestionController.updateQuizQuestion);
router.get('/:id/quiz-question', QuizQuestionController.getEventQuizQuestions);
router.delete('/quiz-question/:id', QuizQuestionController.deleteQuizQuestion);

//quiz
router.post('/quiz-answers', QuizQuestionController.saveUserQuizAnswers); /**TestStatus: working */
router.put(
  '/quiz-answer/:id',
  QuizQuestionController.updateUserQuizAnswer,
); /**TestStatus: working */
router.delete(
  '/quiz-answer/:id',
  QuizQuestionController.deleteUserQuizAnswer,
); /**TestStatus: working */
router.get(
  '/quiz-answers/:userId/:eventId',
  QuizQuestionController.getUserQuizAnswers,
); /**TestStatus: working */

//Talent
router.post('/talent', TalentController.createTalent);
router.get('/talent', TalentController.getAllTalent); /**TestStatus: working */
router.get('/talent/:id', TalentController.getTalent); /**TestStatus: working */
router.put('/talent/:id', TalentController.updateTalent);
router.delete('/talent/:id', TalentController.deleteTalent);

//Ticket types
router.post('/ticket-type', TicketTypeController.createTicketType);
router.put('/ticket-type/:id', TicketTypeController.updateTicketType);
router.delete('/ticket-type/:id', TicketTypeController.deleteTicketType);
router.get('/ticket-type/:id', TicketTypeController.getTicketType); /**TestStatus: working */
router.get('/ticket-types/:id', TicketTypeController.getTicketTypes); /**TestStatus: working */
router.get('/ticket-types/:id/ticket-breakdown', TicketTypeController.getTicketBreakdown); /**TestStatus: working */
// Collaborators
router.get(
  '/collaborators/roles',
  CollaboratorController.getCollaboratorRoles,
); /**TestStatus: working */
// router.post("/collaborator", CollaboratorController.createCollaborator)
// router.put("/collaborator/:id", CollaboratorController.updateCollaborator)
// router.delete("/collaborator/:id", CollaboratorController.deleteCollaborator)
// router.get("/collaborator/:id", CollaboratorController.getCollaborator)
// router.get("/collaborators/:id", CollaboratorController.getCollaborators)
router.get(
  '/default-config-role',
  CollaboratorController.getDefaultRoleConfigByRole,
); /**TestStatus: working */

//Event location
router.post('/event-location', EventsController.createEventLocation);
router.put('/event-location/:id', EventsController.updateEventLocation);
router.get('/event-location/:id', EventsController.getEventLocation);
router.get('/event-locations', EventsController.listEventLocations);
router.delete('/event-location/:id', EventsController.deleteEventLocation);

//events routes
router.post(
  '/event',
  AuthMiddleware.fusionAuthRequired,
  // validateRequest('event'), //TODO: add validation
  EventsController.createEvent,
); /**TestStatus: working */
router.delete(
  '/event/:id',
  AuthMiddleware.fusionAuthRequired,
  EventsController.deleteEvent,
); /**TestStatus: working */
router.put(
  '/event/:id',
  AuthMiddleware.fusionAuthRequired,
  // validateRequest('event'), //TODO: add validation
  EventsController.updateEvent,
); /**TestStatus: working (need to retest mails on update of location or date)*/
router.put(
  '/event/:id/publish',
  AuthMiddleware.fusionAuthRequired,
  EventsController.publishEvent,
); /**TestStatus: working */
router.post(
  '/event/:eventId/cancel',
  AuthMiddleware.fusionAuthRequired,
  EventsController.cancelEventAndNotify,
); /**TestStatus: working(need to check for signup form updates) */
router.get('/event-status', EventsController.listEventStatus); /**TestStatus: working */

router.get('/events', AuthMiddleware.fusionAuthRequired, EventsController.listEvents);
router.get('/feed', EventsController.listEventsFeed);
router.get('/feed/featured', EventsController.getFeaturedEvents);
router.get('/dashboard/upcoming-events', EventsController.getUpcomingEvents);
router.put(
  '/event/:id/duplicate',
  EventsController.duplicateEvent,
); /*this api is not used as we are using create event api to duplicate event*/
router.post('/featured-events', EventsController.addEventToFeaturedSection);
router.get('/public/:eventId', EventsController.getPublicEvent); /**TestStatus: working */
router.get(
  '/users/:userId/events/:eventId',
  EventsController.getEventByInvitedUserId,
); /**TestStatus: working */
router.get(
  '/dashboard/top-users-attendees-events',
  GuestController.getTopUsersAttendees,
); /**TestStatus: working */
router.get(
  '/:eventId/ticket-type/:ticketTypeId/attendees/count',
  GuestController.getEventAttendeeCountByTicketType,
); /**TestStatus: working */
router.get(
  '/events/:eventId/guest-status-counts',
  AuthMiddleware.fusionAuthRequired,
  EventsController.GetGuestCountForGuestStatuses,
);
router.get(
  '/events/:eventId/guest-counts',
  AuthMiddleware.fusionAuthRequired,
  EventsController.getGuestCountsByStatus,
);

/**TODO: TestStatus: not working */

// router.get("/events", AuthMiddleware.fusionAuthRequired, EventsController.listEvents)  /**TestStatus: working */
// router.get("/feed", EventsController.listEventsFeed)
// router.get("/feed/featured", EventsController.getFeaturedEvents)
// router.get("/dashboard/upcoming-events", EventsController.getUpcomingEvents) /**TestStatus: working */
router.put(
  '/event/:id/duplicate',
  EventsController.duplicateEvent,
); /*this api is not used as we are using create event api to duplicate event*/
router.post('/featured-events', EventsController.addEventToFeaturedSection);
router.get('/public/:eventId', EventsController.getPublicEvent); /**TestStatus: working */
router.get(
  '/users/:userId/events/:eventId',
  EventsController.getEventByInvitedUserId,
); /**TestStatus: working */

// router.get("/event/:id", AuthMiddleware.fusionAuthRequired, EventsController.getEvent) /**TestStatus: working */
router.get(
  '/event/:id',
  AuthMiddleware.fusionAuthRequired,
  EventsController.getEvent,
); /**TestStatus: working */

// Host
router.get(
  '/hosts/events',
  AuthMiddleware.fusionAuthRequired,
  EventsController.listHostEvents,
); /**TestStatus: working */

router.get(
  '/hosts/events/count-by-status',
  AuthMiddleware.fusionAuthRequired,
  EventsController.getHostEventCountByStatus,
); /**TestStatus: working */

//admin status
router.put(
  '/admin/events/:eventId/status',
  AuthMiddleware.fusionAuthRequired,
  EventsController.manualEventStatusUpdate,
); /** working */

// Admission types
router.post(
  '/admission-types',
  AdmissionTypeController.createAdmissionType,
); /**TestStatus: working */
router.put(
  '/admission-types/:id',
  AdmissionTypeController.updateAdmissionType,
); /**TestStatus: working */
router.delete(
  '/admission-types/:id',
  AdmissionTypeController.deleteAdmissionType,
); /**TestStatus: working */
router.get(
  '/admissions-types',
  AdmissionTypeController.getAdmissionsTypes,
); /**TestStatus: working */
router.get(
  '/admission-types/:id',
  AdmissionTypeController.getAdmissionTypeById,
); /**TestStatus: working */

//ends here
/**
 * Complete Guest functionality------------------------------------------
 */

router.post('/events/:id/guests', AuthMiddleware.fusionAuthRequired, GuestController.addGuests);
router.post(
  '/events/:id/invite-new-user',
  AuthMiddleware.fusionAuthRequired,
  GuestController.inviteNewUser,
);
router.get('/events/:id/guests', AuthMiddleware.fusionAuthRequired, GuestController.getGuests);
router.put(
  '/events/manage-guests',
  AuthMiddleware.fusionAuthRequired,
  GuestController.manageGuests,
);
router.put('/events/:id/guests', AuthMiddleware.fusionAuthRequired, GuestController.updateGuests);
router.put(
  '/events/:id/guests/revoke',
  AuthMiddleware.fusionAuthRequired,
  GuestController.withdrawInvites,
);
router.delete(
  '/events/:id/guests',
  AuthMiddleware.fusionAuthRequired,
  GuestController.deleteGuests,
);
router.get('/events/:id/guests-overview', GuestController.listGuestsOverview);
// User request,

router.post('/events/request/guest', AuthMiddleware.fusionAuth, GuestController.requestBecomeGuest);

router.put('/events/request/guest', GuestController.updateRequestBecomeGuest);
//Guests Profiles
router.get('/events/guest-profiles/:id', GuestController.listGuestProfiles);
router.get(
  '/events/guest-profile/:id',
  AuthMiddleware.fusionAuthRequired,
  GuestController.getGuestProfile,
);
router.get(
  '/events/guest-details/:id',
  AuthMiddleware.fusionAuthRequired,
  GuestController.getGuestDetails,
);

router.put('/users/:id/events/:eventId/accept', GuestController.acceptEventInvitation);

router.put('/users/:id/events/:eventId/decline', GuestController.declineEventInvitation);

router.put('/users/:id/events/:eventId/cancel', GuestController.cancelEventInvitation);
//Users
router.get(
  '/users/:userId/events/:eventId/request',
  GuestController.getUserRequests,
); /**TestStatus: working */

router.delete('/users/:userId/events/:eventId/guest/:id', GuestController.deleteInvitedGuest);

router.post('/users/:id/events/:eventId/invite-guest', GuestController.inviteGuest);

router.post('/users/:id/events/:eventId/invite-guests', GuestController.inviteGuests);

router.get('/users/:id/events/:eventId/invited-guests', GuestController.listInvitedGuests);

router.post(
  '/events/bulk-user',
  AuthMiddleware.fusionAuthRequired,
  GuestController.bulkUploadGuests,
);

router.get(
  '/events/:count/bulk-user',
  AuthMiddleware.fusionAuthRequired,
  GuestController.fetchBulkGuests,
);

router.get('/events/users/:id/events', GuestController.listGuestEvents); /**TestStatus: TODO: */
router.get('/events/users/:id/simple-events', GuestController.listSimpleGuestEvents);
router.post(
  '/events/request/bulk/guest',
  AuthMiddleware.fusionAuthRequired,
  GuestController.manageBulkGuests,
);
router.get('/events/users-events-invitees/:id', GuestController.getUsersEventInvitees);

//Vouches
router.post(
  '/events/vouch-requests',
  AuthMiddleware.fusionAuthRequired,
  VouchRequestController.createVouchRequest,
); /**TestStatus: working */
router.get(
  '/events/vouch-requests',
  AuthMiddleware.fusionAuthRequired,
  VouchRequestController.getAllVouchRequests,
);
router.put(
  '/events/vouch-requests/:id',
  AuthMiddleware.fusionAuthRequired,
  VouchRequestController.updateVouchRequest,
); /**TestStatus: working */
router.get(
  '/events/user/:id/vouches',
  VouchRequestController.getUserVouches,
); /**TestStatus: working */
router.get(
  '/events/event/:eventId/request/:requesterId',
  VouchRequestController.getUserVouchesByEvent,
);

router.get('/guest/ticket/:id', EventsController.generateTicketForGuest); /**TestStatus: Working; */

//ticket validation QR generation and validation
router.post(
  '/guest/ticket/validate',
  AuthMiddleware.fusionAuthRequired,
  EventsController.validateTicketForGuest,
); /**TestStatus: Working; */
router.post(
  '/guest/ticket/:id/validate',
  AuthMiddleware.fusionAuthRequired,
  EventsController.toggleGuestCheckStatus,
);

router.get(
  '/featured-events-sections',
  AuthMiddleware.fusionAuthRequired,
  FeaturedEventSectionsController.featuredEventSections,
);

router.post(
  '/event/featured-events-sections',
  AuthMiddleware.fusionAuthRequired,
  FeaturedEventSectionsController.createFeaturedEventSection,
);

router.delete(
  '/event/featured-events-sections/:id',
  AuthMiddleware.fusionAuthRequired,
  FeaturedEventSectionsController.deleteFeaturedEventSection,
);

router.get('/guest/event/:id/export', AuthMiddleware.fusionAuthRequired, GuestController.exportCsv);

router.delete('/delete-host-events/:id', EventsController.deleteHostEvents);

router.post('/event/reminders/send', EventsController.sendEventRemindersToAllGuests);


//Sponsorships here
router.post(
  '/sponsorships/opportunities',
  AuthMiddleware.fusionAuthRequired,
  validateRequest('sponsorshipOpportunity'),
  SponsorshipOpportunityController.create,
);

router.get(
  '/sponsorships/opportunities',
  AuthMiddleware.fusionAuthRequired,
  SponsorshipOpportunityController.findAll,
);

router.get(
  '/sponsorships/opportunities/:id',
  AuthMiddleware.fusionAuthRequired,
  SponsorshipOpportunityController.findOne,
);

router.get(
  '/sponsorships/opportunities/host/current/:id',
  AuthMiddleware.fusionAuthRequired,
  SponsorshipOpportunityController.findOneForHost,
);

router.get(
  '/sponsorships/events',
  AuthMiddleware.fusionAuthRequired,
  SponsorshipOpportunityController.findEventsWithSponsorships,
);

router.get(
  '/sponsorships/events/available',
  AuthMiddleware.fusionAuthRequired,
  SponsorshipOpportunityController.findAvailableEvents,
);

router.patch(
  '/sponsorships/opportunities/:id',
  AuthMiddleware.fusionAuthRequired,
  validateRequest('sponsorshipOpportunity'),
  SponsorshipOpportunityController.update,
);

router.delete(
  '/sponsorships/opportunities/:id',
  AuthMiddleware.fusionAuthRequired,
  SponsorshipOpportunityController.remove,
);

router.post(
  '/sponsorships/categories',
  AuthMiddleware.fusionAuthRequired,
  validateRequest('sponsorshipCategory'),
  SponsorshipCategoryController.create,
);

router.get(
  '/sponsorships/categories',
  AuthMiddleware.fusionAuthRequired, 
  SponsorshipCategoryController.findAll);

router.get(
  '/sponsorships/categories/:id',
  AuthMiddleware.fusionAuthRequired,
  SponsorshipCategoryController.findOne,
);

router.patch(
  '/sponsorships/categories/:id',
  AuthMiddleware.fusionAuthRequired,
  validateRequest('sponsorshipCategory'),
  SponsorshipCategoryController.update,
);

router.delete(
  '/sponsorships/categories/:id',
  AuthMiddleware.fusionAuthRequired,
  SponsorshipCategoryController.remove,
);

router.post(
  '/sponsorships/target-sponsors',
  AuthMiddleware.fusionAuthRequired,
  validateRequest('targetSponsor'),
  TargetSponsorController.create,
);

router.get(
  '/sponsorships/target-sponsors',
  AuthMiddleware.fusionAuthRequired,
  TargetSponsorController.findAll,
);

router.get(
  '/sponsorships/target-sponsors/:id',
  AuthMiddleware.fusionAuthRequired,
  TargetSponsorController.findOne,
);

router.patch(
  '/sponsorships/target-sponsors/:id',
  AuthMiddleware.fusionAuthRequired,
  validateRequest('targetSponsor'),
  TargetSponsorController.update,
);

router.delete(
  '/sponsorships/target-sponsors/:id',
  AuthMiddleware.fusionAuthRequired,
  TargetSponsorController.remove,
);

router.post(
  '/cultural-moments',
  AuthMiddleware.fusionAuthRequired,
  validateRequest('culturalMoment'),
  CulturalMomentController.create,
);

router.get(
  '/cultural-moments',
  AuthMiddleware.fusionAuthRequired,
  CulturalMomentController.findAll,
);

router.get(
  '/cultural-moments/:id',
  AuthMiddleware.fusionAuthRequired,
  CulturalMomentController.findOne,
);

router.patch(
  '/cultural-moments/:id',
  AuthMiddleware.fusionAuthRequired,
  validateRequest('culturalMoment'),
  CulturalMomentController.update,
);

router.delete(
  '/cultural-moments/:id',
  AuthMiddleware.fusionAuthRequired,
  CulturalMomentController.remove,
);

router.post(
  '/sponsorships/inquiries',
  AuthMiddleware.fusionAuthRequired,
  validateRequest('sponsorshipInquiry'),
  SponsorshipInquiryController.create,
);

router.get(
  '/sponsorships/inquiries',
  AuthMiddleware.fusionAuthRequired,
  SponsorshipInquiryController.findAll,
);

router.get(
  '/sponsorships/inquiries/:id',
  AuthMiddleware.fusionAuthRequired,
  SponsorshipInquiryController.findOne,
);

router.patch(
  '/sponsorships/inquiries/:id',
  AuthMiddleware.fusionAuthRequired,
  validateRequest('sponsorshipInquiry'),
  SponsorshipInquiryController.update,
);

router.delete(
  '/sponsorships/inquiries/:id',
  AuthMiddleware.fusionAuthRequired,
  SponsorshipInquiryController.remove,
);

export default router;
