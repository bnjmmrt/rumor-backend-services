import * as express from "express";
import { Router } from "express";
import { EventAnnouncementController } from "../controllers/event-announcement.controller";
import { SignupFormsController } from "../controllers/signup-forms.controller";
import { GuestController } from "../controllers/guest.controller";

const router: Router = express.Router();

/**
 * Event Announcements------------------------------------------
 */

router.get("/event/:eventId/event-announcement-guest", EventAnnouncementController.getGuestListForAnnoucement);
router.get("/event/:eventId/event-announcement-guest/:announcementId", EventAnnouncementController.getRecipientListForAnnoucement);
router.post("/event/:eventId/event-announcement", EventAnnouncementController.postAnnouncement);
router.patch("/event/:eventId/event-announcement/:announcementId", EventAnnouncementController.updateAnnouncement);
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

// router.post(
//   "/events/:eventId/signup-forms/:id/publish",
//   (req: Request, res: Response) => {}
// );

/**
 * Complete Guest functionality------------------------------------------
 */

router.post("/events/:id/guests", GuestController.addGuests)
router.post("/events/:id/invite-new-user", GuestController.inviteNewUser)
router.get("/events/:id/guests", GuestController.getGuests)
router.put("/events/manage-guests", GuestController.manageGuests)
router.put("/events/:id/guests", GuestController.updateGuests)
router.put("/events/:id/guests/revoke", GuestController.withdrawInvites)
router.delete("/events/:id/guests", GuestController.deleteGuests)
router.get("/events/:id/guests-overview", GuestController.listGuestsOverview)
// User request event
router.post("/events/request/guest", GuestController.requestBecomeGuest)
router.put("/events/request/guest", GuestController.updateRequestBecomeGuest)
//Guests Profiles
router.get("/events/guest-profiles/:id", GuestController.listGuestProfiles)
router.get("/events/guest-profile/:id", GuestController.getGuestProfile)
router.get("/events/guest-details/:id", GuestController.getGuestDetails)
router.put("/v1/users/:id/events/:eventId/accept", GuestController.acceptEventInvitation)
//users
router.put("/v1/users/:id/events/:eventId/decline", GuestController.declineEventInvitation)
router.put("/v1/users/:id/events/:eventId/cancel", GuestController.cancelEventInvitation)
//Users
router.get("/v1/users/:userId/events/:eventId/request", GuestController.getUserRequests)
router.delete("/v1/users/:userId/events/:eventId/guest/:id", GuestController.deleteInvitedGuest)
router.post("/v1/users/:id/events/:eventId/invite-guest", GuestController.inviteGuest)
router.post("/v1/users/:id/events/:eventId/invite-guests", GuestController.inviteGuests)
router.get("/v1/users/:id/events/:eventId/invited-guests", GuestController.listInvitedGuests)
router.post("/events/:id/bulk-user", GuestController.bulkUploadGuests)
router.get("/events/:count/bulk-user", GuestController.fetchBulkGuests)
router.get("/events/users/:id/events", GuestController.listGuestEvents)
router.post("/events/request/bulk/guest", GuestController.manageBulkGuests)
router.get("/events/users-events-invitees/:id", GuestController.getUsersEventInvitees)

export default router;
