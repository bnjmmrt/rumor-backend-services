import { Router, Request, Response } from "express";
import * as express from "express";
import { EventAnnouncementController } from "../controllers/event-announcement.controller";
import { SignupFormsController } from "../controllers/signup-forms.controller";

const router: Router = express.Router();

router.get("/event/:eventId/event-announcement-guest", EventAnnouncementController.getGuestListForAnnoucement);
router.post("/event-announcement", EventAnnouncementController.postAnnoucement);
router.patch("/event-announcement",EventAnnouncementController.updateAnnouncement);

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

// router.get("/signup-forms/:id/submissions");

// router.post(
//   "/events/:eventId/signup-forms/:id/publish",
//   (req: Request, res: Response) => {}
// );

export default router;
