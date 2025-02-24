import { Request, Response } from "express";
import { SignupFormsServices } from "../services/signup-forms.service";
import { SignupFormStaticQuestions } from "rumor-utils/shared/entities";
import { SignupFormsResponse } from "rumor-utils/shared/events/grpc/events/general.pb";
import { GetResponse } from "rumor-utils/success";
import asyncWrapper from "../server/helpers/asyncWrapper";
export class SignupFormsController {
  public static getStaticQuestions = asyncWrapper(
    async (req, res): Promise<void> => {
      const data: SignupFormStaticQuestions[] =
        await SignupFormsServices.getStaticQuestions();
      res.json(new GetResponse(data));
    }
  );

  public static async get(req: Request): Promise<SignupFormsResponse> {
    const data: SignupFormsResponse = await SignupFormsServices.get("1", "");
    return data;
  }
}
