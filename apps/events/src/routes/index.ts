import { Router, Request, Response } from "express";
import * as express from "express";
import { EventAnnouncementController } from "../controllers/event-announcement.controller";
import { SignupFormsController } from "../controllers/signup-forms.controller";

const router: Router = express.Router();

//router.get('/event-announcement/:eventId/guest-list', EventAnnouncementController.getGuestListForAnnoucement)
router.post("/event-announcement", EventAnnouncementController.postAnnoucement);
router.patch(
  "/event-announcement",
  EventAnnouncementController.updateAnnouncement
);

/**
 * Event Signup Forms------------------------------------------
 */
router.get("/events/:id/signup-forms", (req: Request, res: Response) => {
  return 
});

router.post("/events/:id/signup-forms", (req: Request, res: Response) => {});

router.put(
  "/events/:eventId/signup-forms/:id",
  (req: Request, res: Response) => {}
);

router.post(
  "/events/:eventId/signup-forms/:id/publish",
  (req: Request, res: Response) => {}
);

router.post(
  "/events/:eventId/signup-forms/:id/answers",
  (req: Request, res: Response) => {}
);

router.get("/signup-forms", (req: Request, res: Response) => {});

router.get(
  "/signup-forms/:id/submissions",
  (req: Request, res: Response) => {}
);

router.get("/signup-forms/questions", SignupFormsController.getStaticQuestions);

export default router;
