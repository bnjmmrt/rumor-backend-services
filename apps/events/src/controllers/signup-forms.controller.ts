import { Request, Response } from "express";
import { SignupFormsServices } from "../services/signup-forms.service";
import { SignupFormStaticQuestions } from "rumor-utils/shared/entities";
import { SignupFormsResponse } from "rumor-utils/shared/events/grpc/events/general.pb";
import { GetResponse } from "rumor-utils/success";
import asyncWrapper from "../server/helpers/asyncWrapper";
import {
  CreateSignupFormDto,
  SignupFormAnswersDto,
} from "rumor-utils/shared/events/dtos/signup-forms.dto";
export class SignupFormsController {
  public static getStaticQuestions = asyncWrapper(
    async (req: Request, res: Response): Promise<void> => {
      const data: SignupFormStaticQuestions[] =
        await SignupFormsServices.getStaticQuestions();
      res.json(new GetResponse(data));
    }
  );

  public static get = asyncWrapper(
    async (req: Request, res: Response): Promise<void> => {
      const eventId = req.params.eventId;
      const id = req.params.id;
      const data: SignupFormsResponse = await SignupFormsServices.get(
        id,
        eventId
      );
      res.json(new GetResponse(data));
    }
  );

  public static getByEventId = asyncWrapper(
    async (req: Request, res: Response): Promise<void> => {
      const eventId = req.params.id;
      const data: SignupFormsResponse[] =
        await SignupFormsServices.getByEventId(eventId);
      res.json(new GetResponse(data));
    }
  );

  public static create = asyncWrapper(
    async (req: Request, res: Response): Promise<void> => {
      const eventId = req.params.id;
      const payload = req.body as any;
      const data: SignupFormsResponse = await SignupFormsServices.create(
        eventId,
        payload
      );
      res.json(new GetResponse(data));
    }
  );
  public static update = asyncWrapper(
    async (req: Request, res: Response): Promise<void> => {
      const eventId = req.params.eventId;
      const id = req.params.id;
      const payload = req.body as CreateSignupFormDto;
      const data: SignupFormsResponse = await SignupFormsServices.update(
        id,
        eventId,
        payload
      );
      res.json(new GetResponse(data));
    }
  );

  public static getByUrl = asyncWrapper(
    async (req: Request, res: Response): Promise<void> => {
      const code = req.query.urlCode as string;
      const data: SignupFormsResponse = await SignupFormsServices.getByUrl(
        code
      );
      res.json(new GetResponse(data));
    }
  );
  public static submitAnswers = asyncWrapper(
    async (req: Request, res: Response): Promise<void> => {
      const eventId = req.params.eventId;
      const id = req.params.id;
      const payload = req.body as SignupFormAnswersDto[];
      await SignupFormsServices.answers(id, eventId, payload);
      res.json(new GetResponse({}));
    }
  );

  public static deactivate = asyncWrapper(
    async (req: Request, res: Response): Promise<void> => {
      const id = req.params.id;
      await SignupFormsServices.deactivate(id);
      res.json(new GetResponse({}));
    }
  );

  public static listSubmissions = asyncWrapper(
    async (req: Request, res: Response): Promise<void> => {
      const payload = req.query;
      const id = req.params.id;
      const submissions = await SignupFormsServices.listSubmissions(
        id,
        payload
      );
      res.json(new GetResponse(submissions));
    }
  );
}
