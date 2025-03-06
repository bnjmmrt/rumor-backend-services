import * as express from "express";
import { Router } from "express";
import { EventAnnouncementController } from "../controllers/event-announcement.controller";
import { SignupFormsController } from "../controllers/signup-forms.controller";
import { GuestController } from "../controllers/guest.controller";
import AuthMiddleware from '../server/middleware/auth';
import { EventsController } from "../controllers/events.controller";
import { VouchRequestController } from "../controllers/vouch-request.controller";
import { QuizQuestionController } from "../controllers/quiz-question.controller";
import { TalentController } from "../controllers/talent.controller";
import { TicketTypeController } from "../controllers/ticket-type.controller";

const router: Router = express.Router();

/**
 * Event Announcements------------------------------------------
 */

router.get("/event/:eventId/event-announcement-guest", EventAnnouncementController.getGuestListForAnnoucement);
router.get("/event/:eventId/event-announcement-guest/:announcementId", EventAnnouncementController.getRecipientListForAnnoucement);

//example route with auth implemented
router.post("/event/:eventId/event-announcement", AuthMiddleware.fusionAuthRequired, EventAnnouncementController.postAnnouncement);
router.patch("/event/:eventId/event-announcement/:announcementId", AuthMiddleware.fusionAuthRequired, EventAnnouncementController.updateAnnouncement);

// Exposed API for interserivce communication
router.get("/event/:eventId/event-announcement/:announcementId", EventAnnouncementController.getAnnouncement);

router.get("/event/:eventId/event-announcements", EventAnnouncementController.getAnnouncements);
router.delete("/event/:eventId/event-announcement/:announcementId", EventAnnouncementController.deleteAnnouncement);

/**
 * Event Signup Forms------------------------------------------
 */

router.get("/signup-forms/questions", SignupFormsController.getStaticQuestions);
router.get("/events/:id/signup-forms", SignupFormsController.getByEventId);
router.get("/events/:eventId/signup-forms/:id", SignupFormsController.get);
router.get("/signup-forms", SignupFormsController.getByUrl);

router.post("/events/:id/signup-forms", SignupFormsController.create);
router.put("/events/:eventId/signup-forms/:id", SignupFormsController.update);
router.post(
  "/events/:eventId/signup-forms/:id/answers",
  SignupFormsController.submitAnswers
);
router.patch("/signup-forms/:id/deactivate", SignupFormsController.deactivate);

router.get(
  "/signup-forms/:id/submissions",
  SignupFormsController.listSubmissions
);

router.patch(
  "/signup-forms/:id/set-name",
  SignupFormsController.setName
);

// router.post(
//   "/events/:eventId/signup-forms/:id/publish",
//   (req: Request, res: Response) => {}
// );

//events routes
router.post("/event/:eventId/cancel", EventsController.cancelEventAndNotify);
router.get("/event-status", EventsController.listEventStatus);


//event types starts
router.post("/event-type", EventsController.createEventType)
router.put("/event-type/:id", EventsController.updateEventType)
router.get("/event-type/:id", EventsController.getEventType)
router.get("/event-types", EventsController.listEventTypes)
router.delete("/event-type/:id", EventsController.deleteEventType)
//ends here

//Event age limit
router.post("/event-age-limit", EventsController.createEventAgeLimit)
router.put("/event-age-limit/:id", EventsController.updateEventAgeLimit)
router.get("/event-age-limit/:id", EventsController.getEventAgeLimit)
router.get("/event-age-limits", EventsController.listEventAgeLimits)
router.delete("/event-age-limit/:id", EventsController.deleteEventAgeLimit)


//Event quiz questions
router.post("/quiz-question", QuizQuestionController.createQuizQuestion)
router.put("/quiz-question/:id", QuizQuestionController.updateQuizQuestion)
router.get("/:id/quiz-question", QuizQuestionController.getEventQuizQuestions)
router.delete("/quiz-question/:id", QuizQuestionController.deleteQuizQuestion)

//quiz
router.post("/quiz-answers", QuizQuestionController.saveUserQuizAnswers)
router.put("/quiz-answer/:id", QuizQuestionController.updateUserQuizAnswer)
router.delete("/quiz-answer/:id", QuizQuestionController.deleteUserQuizAnswer)
router.get("/quiz-answers/:userId/:eventId", QuizQuestionController.getUserQuizAnswers)

//Talent
router.post("/talent", TalentController.createTalent)
router.get("/talent", TalentController.getAllTalent)
router.get("/talent/:id", TalentController.getTalent)
router.put("/talent/:id", TalentController.updateTalent)
router.delete("/talent/:id", TalentController.deleteTalent)

//Ticket types
router.post("/ticket-type", TicketTypeController.createTicketType)
router.put("/ticket-type/:id", TicketTypeController.updateTicketType)
router.delete("/ticket-type/:id", TicketTypeController.deleteTicketType)
router.get("/ticket-type/:id", TicketTypeController.getTicketType)
router.get("/ticket-types/:id", TicketTypeController.getTicketTypes)

// Collaborators
// router.get("/collaborators/roles", CollaboratorController.getCollaboratorRoles)
// router.post("/collaborator", CollaboratorController.createCollaborator)
// router.put("/collaborator/:id", CollaboratorController.updateCollaborator)
// router.delete("/collaborator/:id", CollaboratorController.deleteCollaborator)
// router.get("/collaborator/:id", CollaboratorController.getCollaborator)
// router.get("/collaborators/:id", CollaboratorController.getCollaborators)

//Event location
router.post("/event-location", EventsController.createEventLocation)
router.put("/event-location/:id", EventsController.updateEventLocation)
router.get("/event-location/:id", EventsController.getEventLocation)
router.get("/event-locations", EventsController.listEventLocations)
router.delete("/event-location/:id", EventsController.deleteEventLocation)

//Events
router.post("/event", AuthMiddleware.fusionAuthRequired, EventsController.createEvent)
router.delete("/event/:id", AuthMiddleware.fusionAuthRequired, EventsController.deleteEvent)
router.put("/event/:id", AuthMiddleware.fusionAuthRequired, EventsController.updateEvent)
router.put("/event/:id/publish", AuthMiddleware.fusionAuthRequired, EventsController.publishEvent)

// //Events
// p.Delete("/event/:id", svc.DeleteEvent)
// p.Put("/event/:id/publish", svc.PublishEvent)
// p.Post("/event", svc.CreateEvent)
// a.Put("/event/:id", svc.UpdateEvent)

router.get("/events", EventsController.listEvents)
router.get("/feed", EventsController.listEventsFeed)
router.get("/feed/featured", EventsController.getFeaturedEvents)
router.get("/dashboard/upcoming-events", EventsController.getUpcomingEvents)
router.put("/event/:id/duplicate", EventsController.duplicateEvent)
router.post("/featured-events", EventsController.addEventToFeaturedSection)
router.get("/public/:eventId", EventsController.getPublicEvent)
router.get("/users/:userId/events/:eventId", EventsController.getEventByInvitedUserId)

router.get("/event/:id", AuthMiddleware.fusionAuthRequired, EventsController.getEvent)

// Host
router.get("/hosts/events", AuthMiddleware.fusionAuthRequired, EventsController.listHostEvents)
//admin status
router.put("/v1/admin/events/:eventId/status", EventsController.manualEventStatusUpdate)

//ends here
/**
 * Complete Guest functionality------------------------------------------
 */

router.post("/events/:id/guests", AuthMiddleware.fusionAuthRequired, GuestController.addGuests)
router.post("/events/:id/invite-new-user", AuthMiddleware.fusionAuthRequired, GuestController.inviteNewUser)
router.get("/events/:id/guests", AuthMiddleware.fusionAuthRequired, GuestController.getGuests)
router.put("/events/manage-guests", AuthMiddleware.fusionAuthRequired, GuestController.manageGuests)
router.put("/events/:id/guests", AuthMiddleware.fusionAuthRequired, GuestController.updateGuests)
router.put("/events/:id/guests/revoke", AuthMiddleware.fusionAuthRequired, GuestController.withdrawInvites)
router.delete("/events/:id/guests", AuthMiddleware.fusionAuthRequired, GuestController.deleteGuests)
router.get("/events/:id/guests-overview", GuestController.listGuestsOverview)
// User request,
router.post("/events/request/guest", AuthMiddleware.fusionAuthRequired, GuestController.requestBecomeGuest)
router.put("/events/request/guest", AuthMiddleware.fusionAuthRequired, GuestController.updateRequestBecomeGuest)
//Guests Profiles
router.get("/events/guest-profiles/:id", GuestController.listGuestProfiles)
router.get("/events/guest-profile/:id", AuthMiddleware.fusionAuthRequired, GuestController.getGuestProfile)
router.get("/events/guest-details/:id", AuthMiddleware.fusionAuthRequired, GuestController.getGuestDetails)
router.put("/v1/users/:id/events/:eventId/accept", AuthMiddleware.fusionAuthRequired, GuestController.acceptEventInvitation)
//users
router.put("/v1/users/:id/events/:eventId/decline", AuthMiddleware.fusionAuthRequired, GuestController.declineEventInvitation)
router.put("/v1/users/:id/events/:eventId/cancel", AuthMiddleware.fusionAuthRequired, GuestController.cancelEventInvitation)
//Users
router.get("/v1/users/:userId/events/:eventId/request", GuestController.getUserRequests)
router.delete("/v1/users/:userId/events/:eventId/guest/:id", GuestController.deleteInvitedGuest)
router.post("/v1/users/:id/events/:eventId/invite-guest", AuthMiddleware.fusionAuthRequired, GuestController.inviteGuest)
router.post("/v1/users/:id/events/:eventId/invite-guests", AuthMiddleware.fusionAuthRequired, GuestController.inviteGuests)
router.get("/v1/users/:id/events/:eventId/invited-guests", GuestController.listInvitedGuests)
router.post("/events/:id/bulk-user", AuthMiddleware.fusionAuthRequired, GuestController.bulkUploadGuests)
router.get("/events/:count/bulk-user", AuthMiddleware.fusionAuthRequired, GuestController.fetchBulkGuests)
router.get("/events/users/:id/events", GuestController.listGuestEvents)
router.post("/events/request/bulk/guest", AuthMiddleware.fusionAuthRequired, GuestController.manageBulkGuests)
router.get("/events/users-events-invitees/:id", GuestController.getUsersEventInvitees)

//Vouches
router.get('/events/vouch-requests', VouchRequestController.createVouchRequest);
router.get('/events/vouch-requests', VouchRequestController.getAllVouchRequests);
router.get('/events/vouch-requests/:id', VouchRequestController.updateVouchRequest);
router.post('/events/user/:id/vouches', VouchRequestController.getUserVouches);
router.post('/events/event/:id', VouchRequestController.getUserVouchesByEvent);


//ticket validation QR generation and validation
router.post("/guest/ticket/validate", AuthMiddleware.fusionAuthRequired, EventsController.validateTicketForGuest)
router.post("/guest/ticket/:id/validate", AuthMiddleware.fusionAuthRequired, EventsController.toggleGuestCheckStatus)

export default router;
