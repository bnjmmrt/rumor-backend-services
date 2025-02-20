import express, { Router, Request, Response } from 'express';
import { EventAnnouncementController } from 'src/controllers/event-announcement.controller';

const router: Router = express.Router();

//router.get('/event-announcement/:eventId/guest-list', EventAnnouncementController.getGuestListForAnnoucement)
router.post('/event-announcement',EventAnnouncementController.postAnnoucement);
router.patch('/event-announcement',EventAnnouncementController.updateAnnouncement);

export default router;