import express, { Router, Request, Response } from "express";
import { EventAnnouncementController } from "src/controllers/event-announcement.controller";
import { SignupFormsController } from "src/controllers/signup-forms.controller";

const router: Router = express.Router();

//router.get('/event-announcement/:eventId/guest-list', EventAnnouncementController.getGuestListForAnnoucement)
router.post("/event-announcement", EventAnnouncementController.postAnnoucement);
router.patch(
  "/event-announcement",
  EventAnnouncementController.updateAnnouncement
);
router.get("/events/:id/signup-forms", (req: Request, res: Response) => {});

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

router.get("/signup-forms/questions", (req: Request, res: Response) => {
  SignupFormsController.getStaticQuestions(req);
});
export default router;
