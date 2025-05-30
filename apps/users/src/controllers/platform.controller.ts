import {
  FocusResponse,
  GenericResponse,
  InterestResponse,
  InterestsResponse,
} from 'rumor-utils/shared/events/grpc/platform/platform.pb';
import { ForgotPasswordRequestDto } from 'rumor-utils/shared/users/dtos/auth.dto';
import { CreateResponse, DeleteResponse, GetResponse, UpdateResponse } from 'rumor-utils/success';
import asyncWrapper from '../server/helpers/asyncWrapper';
import { AuthService } from '../services/auth.service';
import { PlatformService } from '../services/platform.service';
import {
  AddFocusRequestDto,
  CreateInterestRequestDto,
  EditFocusNameRequestDto,
  IdRequestDto,
  SaveFocusesForUserRequestoDto,
  SaveInterestsForUserRequestDto,
  UpdateInterestRequestDto,
} from 'rumor-utils/shared/users/dtos/platform.dto';
import { FocusData, InterestData } from 'rumor-utils/shared/users/grpc/platform/general.pb';

export class PlatformController {
  public static getFocuses = asyncWrapper(async (req, res): Promise<void> => {
    const response: FocusData[] = await PlatformService.getFocuses();
    const getResponse = new GetResponse(response);
    res.status(getResponse.statusCode).json(getResponse);
  });

  public static getUserFocuses = asyncWrapper(async (req, res): Promise<void> => {
    const { id } = req.params;
    const payload: IdRequestDto = { id };
    const response: FocusData[] = await PlatformService.getUserFocuses(payload);
    const getResponse = new GetResponse(response);
    res.status(getResponse.statusCode).json(getResponse);
  });

  public static addFocus = asyncWrapper(async (req, res): Promise<void> => {
    const payload: AddFocusRequestDto = req.body;
    const response: string = await PlatformService.addFocus(payload);
    const createResponse = new CreateResponse(response);
    res.status(createResponse.statusCode).json(createResponse);
  });

  public static editFocusName = asyncWrapper(async (req, res): Promise<void> => {
    const payload: EditFocusNameRequestDto = req.body;
    const response: GenericResponse = await PlatformService.editFocusName(payload);
    const updateResponse = new UpdateResponse(response, 'Focus name updated');
    res.status(updateResponse.statusCode).json(updateResponse);
  });

  public static saveFocusesForUser = asyncWrapper(async (req, res): Promise<void> => {
    const { userId } = req.params;
    const payload: SaveFocusesForUserRequestoDto = { ...req.body, userId };
    const response: GenericResponse = await PlatformService.saveFocusesForUser(payload);
    const createResponse = new CreateResponse(response);
    res.status(createResponse.statusCode).json(createResponse);
  });

  public static createInterest = asyncWrapper(async (req, res): Promise<void> => {
    const payload: CreateInterestRequestDto = req.body;
    const response: InterestData = await PlatformService.createInterest(payload);
    const createResponse = new CreateResponse(response, 'Interest created succesfully');
    res.status(createResponse.statusCode).json(createResponse);
  });

  public static listInterests = asyncWrapper(async (req, res): Promise<void> => {
    const response: InterestData[] = await PlatformService.listInterests();
    const getResponse = new GetResponse(response, 'Interest retreived succesfully');
    res.status(getResponse.statusCode).json(getResponse);
  });

  public static getUserInterests = asyncWrapper(async (req, res): Promise<void> => {
    const payload: IdRequestDto = req.params;
    const response: InterestData[] = await PlatformService.getUserInterests(payload);
    const getResponse = new GetResponse(response);
    res.status(getResponse.statusCode).json(getResponse);
  });

  public static saveInterestsForUser = asyncWrapper(async (req, res): Promise<void> => {
    const { id } = req.params;
    const userId = id;
    const payload: SaveInterestsForUserRequestDto = {
      ...req.body,
      userId,
    };
    const response: GenericResponse = await PlatformService.saveInterestsForUser(payload);
    const createResponse = new CreateResponse(response);
    res.status(createResponse.statusCode).json(createResponse);
  });

  public static updateInterest = asyncWrapper(async (req, res): Promise<void> => {
    const { id } = req.params;
    const payload: UpdateInterestRequestDto = { ...req.body, id };
    const response: InterestData = await PlatformService.updateInterest(payload);
    const updateResponse = new UpdateResponse(response, 'Interest updated succesfully');
    res.status(updateResponse.statusCode).json(updateResponse);
  });

  public static deleteInterest = asyncWrapper(async (req, res): Promise<void> => {
    const payload: IdRequestDto = req.params;
    const response: GenericResponse = await PlatformService.deleteInterest(payload);
    const deleteResponse = new DeleteResponse(response, 'Interest deleted successfully');
    res.status(deleteResponse.statusCode).json(deleteResponse);
  });

  public static redirectUser = asyncWrapper(async (req, res): Promise<void> => {
    (req, res) => {
      // Replace these with your actual links
      const WEBSITE_URL = 'https://therumor.com';
      const ANDROID_APP_LINK = 'therumorapp://';
      const IOS_APP_LINK = 'therumorapp://';
      const ANDROID_STORE_URL = 'https://play.google.com/store/apps/details?id=com.yourapp.package';
      const IOS_STORE_URL = 'https://apps.apple.com/app/id1234567890';

      const userAgent = req.headers['user-agent'] || '';
      const isAndroid = /Android/i.test(userAgent);
      const isIOS = /iPhone|iPad|iPod/i.test(userAgent);

      const isMobile = isAndroid || isIOS;
      if (!isMobile) {
        // Desktop browser
        return res.redirect(WEBSITE_URL);
      }

      // For mobile devices – serve an HTML with JS-based fallback
      const fallbackUrl = isIOS ? IOS_STORE_URL : ANDROID_STORE_URL;
      const appUrl = isIOS ? IOS_APP_LINK : ANDROID_APP_LINK;

      return res.redirect(appUrl);
    };
    //   res.send(`
    //     <!DOCTYPE html>
    //     <html>
    //       <head>
    //         <title>Redirecting...</title>
    //         <meta name="viewport" content="width=device-width, initial-scale=1.0">
    //         <script type="text/javascript">
    //         try{
    // setTimeout(function() {
    //             window.location.href = "${fallbackUrl}";
    //           }, 2500); // fallback after 2.5s

    //           window.location = "${appUrl}";

    //         }
    //           catch(e){
    //           console.log('------',e)
    //           }

    //         </script>
    //       </head>
    //       <body>
    //         <p>Redirecting to the app...</p>
    //       </body>
    //     </html>
    //   `);
  });
}
