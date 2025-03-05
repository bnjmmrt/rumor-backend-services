import * as express from "express";
import { Router } from "express";
import { EventAnnouncementController } from "../controllers/event-announcement.controller";
import { SignupFormsController } from "../controllers/signup-forms.controller";
import AuthMiddleware from '../server/middleware/auth';
import { EventsController } from "../controllers/events.controller";

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

// router.post(
//   "/events/:eventId/signup-forms/:id/publish",
//   (req: Request, res: Response) => {}
// );

//events routes
router.post("/event/:eventId/cancel", EventsController.CancelEventAndNotify);
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


//ends here

export default router;
