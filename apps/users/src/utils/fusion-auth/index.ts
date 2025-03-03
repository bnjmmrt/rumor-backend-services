import { Request, Response, NextFunction } from "express";
import config from '../../config'
import FusionAuthClient, { RegistrationRequest } from '@fusionauth/typescript-client';
import {ValidateResponse} from 'rumor-utils/shared/users/grpc/auth/auth.pb'
import { ValidateRequestDto } from "rumor-utils/shared/users/dtos/auth.dto";
import { responses } from "../../common/responses.common";

class AuthMiddleware {
    public static fusionAuthClient = new FusionAuthClient(config.get('FUSIONAUTH_API_KEY'), config.get('FUSIONAUTH_BASE_URL'));    
    static fusionAuthRequired = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const authorization = req.header("Authorization");
        if (!authorization) {
            res.status(401).send("Unauthorized");
        }

        const tokenParts = authorization.split("Bearer ");
        if (tokenParts.length < 2) {
            res.status(401).send("Unauthorized");
        }
        const token = tokenParts[1];

        const response = await this.validate({ token });

        if (!response || response.status !== 200 || !response.data.userId) {
            res.status(401).send("Unauthorized");
        }

        // Simulating token validation
        const userId = response.data.userId;
        (req as any).userId = userId;

        next();
    };

    public static async validate({ token }: ValidateRequestDto): Promise<ValidateResponse> {
        try {
          const findUser = await this.fusionAuthClient.retrieveUserUsingJWT(token);
          if (!findUser?.response?.user?.active) {
            return responses.forbidden('User is not active');
          }
          return responses.data({
            userId: findUser.response.user.id,
            user: {
              username: findUser?.response?.user?.username || '',
              email: findUser?.response?.user?.email || '',
              firstName: findUser?.response?.user?.firstName || '',
              lastName: findUser?.response?.user?.lastName || '',
              active: !!findUser?.response?.user?.active,
              birthDate: findUser?.response?.user?.birthDate || '',
              mobilePhone: findUser?.response?.user?.mobilePhone || '',
              verified: !!findUser?.response?.user?.verified,
              roles: [],
            },
          });
        } catch (err) {
          if (err?.statusCode == 423) {
            return responses.forbidden('User is locked.');
          }
          if (err.statusCode == 404) {
            return responses.forbidden('Verify your password and email.');
          }
          return responses.badRequest('Unable to validate user.');
        }
      }

    static checkPermission = (permission: string) => {
        return (req: Request, res: Response, next: NextFunction) => {
            const userId = res.getHeader("userId") as string;

            // Simulating permission check
            const isAllowed = true; // Replace with actual permission validation logic
            if (!isAllowed) {
                return res.status(403).send("Forbidden");
            }
            next();
        };
    };

    checkAdminRole = (req: Request, res: Response, next: NextFunction) => {
        const userId = res.getHeader("userId") as string;
        const adminRole = "admin";

        // Simulating role check
        const isAdmin = true; // Replace with actual role validation logic
        if (!isAdmin) {
            return res.status(403).send("Forbidden");
        }
        next();
    };
}

export default AuthMiddleware;
