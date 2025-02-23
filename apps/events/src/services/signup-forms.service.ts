import { SignupFormStaticQuestions } from "rumor-utils/shared/entities";

export class SignupFormsServices {
  public static async getStaticQuestions() {
    const staticQuestions = await SignupFormStaticQuestions.find({
      where: {
        isActive: true,
      },
    });
    return staticQuestions;
  }
}
