import * as express from "express";
import { Router } from "express";
import { EventAnnouncementController } from "../controllers/event-announcement.controller";
import { SignupFormsController } from "../controllers/signup-forms.controller";
import { GuestController } from "../controllers/guest.controller";
import AuthMiddleware from '../server/middleware/auth';

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
router.put("/v1/users/:id/events/:eventId/cancel", AuthMiddleware.fusionAuthRequired,  GuestController.cancelEventInvitation)
//Users
router.get("/v1/users/:userId/events/:eventId/request", GuestController.getUserRequests)
router.delete("/v1/users/:userId/events/:eventId/guest/:id", GuestController.deleteInvitedGuest)
router.post("/v1/users/:id/events/:eventId/invite-guest",AuthMiddleware.fusionAuthRequired, GuestController.inviteGuest)
router.post("/v1/users/:id/events/:eventId/invite-guests", AuthMiddleware.fusionAuthRequired,  GuestController.inviteGuests)
router.get("/v1/users/:id/events/:eventId/invited-guests", GuestController.listInvitedGuests)
router.post("/events/:id/bulk-user", AuthMiddleware.fusionAuthRequired, GuestController.bulkUploadGuests)
router.get("/events/:count/bulk-user", AuthMiddleware.fusionAuthRequired, GuestController.fetchBulkGuests)
router.get("/events/users/:id/events", GuestController.listGuestEvents)
router.post("/events/request/bulk/guest", AuthMiddleware.fusionAuthRequired, GuestController.manageBulkGuests)
router.get("/events/users-events-invitees/:id", GuestController.getUsersEventInvitees)

export default router;
