import { Request } from "express";
import { SignupFormsServices } from "src/services/signup-forms.service";

export class SignupFormsController {
  //@GrpcMethod(AUTH_SERVICE_NAME, 'ForgotPassword')
  public static getStaticQuestions(req: Request): Promise<any> {
    return SignupFormsServices.getStaticQuestions();
  }
}
