import { Request, Response } from 'express';
import { SignupFormsServices } from '../services/signup-forms.service';
import { SignupFormStaticQuestions } from 'rumor-utils/shared/entities';
import {
  EventGuestRequest,
  SignupFormsResponse,
} from 'rumor-utils/shared/events/grpc/events/general.pb';
import { GetResponse } from 'rumor-utils/success';
import asyncWrapper from '../server/helpers/asyncWrapper';
import {
  CreateSignupFormDto,
  SignupFormAnswersDto,
} from 'rumor-utils/shared/events/dtos/signup-forms.dto';
import { BadRequestError } from 'rumor-utils/errors';
import { UpdateResult } from 'typeorm';
import { isValidEmail, isValidPhoneNumber } from 'rumor-utils/utils/file-utils';
export class SignupFormsController {
  public static getStaticQuestions = asyncWrapper(
    async (req: Request, res: Response): Promise<void> => {
      const data: SignupFormStaticQuestions[] = await SignupFormsServices.getStaticQuestions();
      res.json(new GetResponse(data));
    },
  );

  public static get = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const eventId = req.params.eventId;
    const id = req.params.id;
    const data: SignupFormsResponse = await SignupFormsServices.get(id, eventId);
    res.json(new GetResponse(data));
  });

  public static getByEventId = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const hostId = (req as any).user;
    const eventId = req.params.id;
    const data: SignupFormsResponse[] = await SignupFormsServices.getByEventId(eventId, hostId);
    res.json(new GetResponse(data));
  });

  public static create = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const eventId = req.params.id;
    const payload = req.body as CreateSignupFormDto;
    const hostId = (req as any).user;
    if (payload.userId !== hostId) {
      throw new BadRequestError('Invalid host id provided.');
    }
    const data: SignupFormsResponse = await SignupFormsServices.create(eventId, payload);
    res.json(new GetResponse(data));
  });
  public static update = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const eventId = req.params.eventId;
    const id = req.params.id;
    const payload = req.body as CreateSignupFormDto;
    const hostId = (req as any).user;
    if (payload.userId !== hostId) {
      throw new BadRequestError('Invalid host id provided.');
    }
    console.log('payload', payload);
    const data: SignupFormsResponse = await SignupFormsServices.update(id, eventId, payload);
    res.json(new GetResponse(data));
  });

  public static getByUrl = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const code = req.query.urlCode as string;
    const data: SignupFormsResponse = await SignupFormsServices.getByUrl(code);
    res.json(new GetResponse(data));
  });
  public static submitAnswers = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const eventId = req.params.eventId;
    const id = req.params.id;
    const payload = req.body as SignupFormAnswersDto[];
    // console.log(`🚀 ~ SignupFormsController ~ submitAnswers=asyncWrapper ~ payload: ${new Date()}`, payload)
    // const answers =
    await SignupFormsServices.answers(id, eventId, payload);
    // console.log(`🚀 ~ SignupFormsController ~ submitAnswers=asyncWrapper ~ answers: ${new Date()}`)
    res.json(new GetResponse({}));
  });

  public static checkIfGuestExists = asyncWrapper(
    async (req: Request, res: Response): Promise<void> => {
      const payload = req.body as EventGuestRequest;
      if (!payload.email && !payload.phoneNumber) {
        throw new BadRequestError('User information (email or phone) is required.');
      }

      if (payload.email) {
        if (!isValidEmail(payload.email.trim())) {
          throw new BadRequestError('Email is not valid');
        }
      }

      if (payload.phoneNumber) {
        if (!isValidPhoneNumber(payload.phoneNumber)) {
          throw new BadRequestError('Phone number is not valid');
        }
      }
      await SignupFormsServices.validateGuestExistence(payload);
      res.json(new GetResponse({}));
    },
  );

  public static deactivate = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    const hostId = (req as any).user;
    const data: UpdateResult = await SignupFormsServices.deactivate(id, hostId);
    const successResponse = new GetResponse(data.affected);
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static listSubmissions = asyncWrapper(
    async (req: Request, res: Response): Promise<void> => {
      const payload = req.query;
      const id = req.params.id;
      const hostId = (req as any).user;
      const submissions = await SignupFormsServices.listSubmissions(id, hostId, payload);
      res.json(new GetResponse(submissions));
    },
  );

  public static exportCsv = asyncWrapper(async (req, res): Promise<void> => {
    const { id } = req.params;
    const hostId = (req as any).user;
    const query = req.query as string;

    try {
      // Call the service to generate the CSV
      const csvData = await SignupFormsServices.exportCsv(id, hostId, query);

      // Set the headers to indicate the content type and prompt a download
      res.header('Content-Type', 'text/csv');
      res.attachment('submissions_export.csv');

      // Send the generated CSV data to the client
      res.send(csvData);
    } catch (error) {
      // If any error occurs, return a 500 status code
      res.status(500).send('Error generating CSV');
    }
  });

  public static getSignupFormQuestions = asyncWrapper(
    async (req: Request, res: Response): Promise<void> => {
      const id = req.params.id;
      const submission = await SignupFormsServices.getSignupFormQuestions(id);
      res.json(new GetResponse(submission));
      console.log('submission', submission);
    },
  );

  // public static setName = asyncWrapper(
  //   async (req: Request, res: Response): Promise<void> => {
  //     const payload = req.body;
  //     const id = req.params.id;
  //     const sforms = await SignupFormsServices.setName(id, payload.name);
  //     res.json(new GetResponse(sforms));
  //   }
  // );
}
