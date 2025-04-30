import { Request, Response, NextFunction, response } from 'express';
import config from '../../config';
import FusionAuthClient from '@fusionauth/typescript-client';
import { ValidateRequestDto } from 'rumor-utils/shared/users/dtos/auth.dto';
import { ForbiddenError, AuthorizationError } from 'rumor-utils/errors';
import { RoleService } from '../../services/role.service';
// import { User } from 'rumor-utils/shared/entities';
// import { UserStatus } from 'rumor-utils/shared/users/interfaces/shared.interface';

class AuthMiddleware {
  fusionAuthRequired = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authorization = req.header('Authorization');
      if (!authorization) {
        res.status(401).send('Unauthorized');
        return;
      }

      const tokenParts = authorization.split('Bearer ');
      if (tokenParts.length < 2) {
        res.status(401).send('Unauthorized');
        return;
      }
      const token = tokenParts[1];

      const response = await this.validate({ token });

      console.log(`Response Validated${response?.userId}`)
      if (!response || !response.userId) {
        console.log(`Response Validation Failed`);
        res.status(401).send('Unauthorized');
        return;
      }

      (req as any).user = response.userId;
      (req as any).token = token;

      next();
    } catch (error) {
      const errMsg = new AuthorizationError(`Session has expired, Please login again`);
      res.status(401).send(errMsg);
    }
  };

  fusionAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authorization = req.header('Authorization');

      if (!authorization) {
        next();
        return;
      }

      const tokenParts = authorization.split('Bearer ');
      if (tokenParts.length < 2) {
        res.status(401).send('Unauthorized');
        return;
      }
      const token = tokenParts[1];

      const response = await this.validate({ token });

      if (!response || !response.userId) {
        res.status(401).send('Unauthorized');
        return;
      }

      (req as any).user = response.userId;
      (req as any).token = token;

      next();
    } catch (error) {
      const errMsg = new AuthorizationError(`Session has expired, Please login again `);
      res.status(401).send(errMsg);
    }
  };

  async validate({ token }: ValidateRequestDto): Promise<any> {
    try {
      console.log('Token Validation started');
      const fusionAuthClient = new FusionAuthClient(
        config.get('FUSIONAUTH_API_KEY'),
        config.get('FUSIONAUTH_BASE_URL'),
      );
      console.log(
        `Token Validation Value :::  ${config.get('FUSIONAUTH_API_KEY')}  AND ${config.get('FUSIONAUTH_BASE_URL')}`,
      );
      const findUser = await fusionAuthClient.retrieveUserUsingJWT(token);
      console.log('Retrieved User from FusionAuth');

      if (!findUser?.response?.user?.active) {
        throw new ForbiddenError('User is not active');
      }

      console.log(`Users Retrieved ${findUser?.response?.user?.email}`);
      // const userDetails = await User.findOne({
      //   where: { email: findUser.response.user.email },
      //   relations: { roles: { role: true } },
      // });

      // const hasRestricted = userDetails?.roles?.filter(
      //   ur =>
      //     ['member', 'non_member'].includes(ur?.role?.name) &&
      //     ur.status === UserStatus.DEACTIVATED
      // );

      // if (hasRestricted?.length > 0) {
      //   throw new AuthorizationError('User role is deactivated');
      // }

      return {
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
      };
    } catch (err) {
      console.log('FusionAuth Throws an error');
      throw new Error(err.statusCode);
    }
  }

  checkPermission = (permission: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const userId = res.getHeader('userId') as string;

      // Simulating permission check
      const isAllowed = true; // Replace with actual permission validation logic
      if (!isAllowed) {
        return res.status(403).send('Forbidden');
      }
      next();
    };
  };

  checkAdminRole = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const userId = (req as any).user;

      if (!userId) {
        res.status(401).send('Unauthorized');
        return;
      }

      const roleName = 'admin';
      const { isAllowed } = await RoleService.checkRole({ userId, roleName });

      if (!isAllowed) {
        res.status(403).send('Forbidden');
        return;
      }

      next();
    } catch (error) {
      res.status(500).send(`Error checking admin role: ${error.message || error}`);
    }
  };

  checkHostRole = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const userId = (req as any).user;
      if (!userId) {
        res.status(401).send('Unauthorized');
        return;
      }
      const roleName = 'host';
      const { isAllowed } = await RoleService.checkHostRole({ userId, roleName });
      if (!isAllowed) {
        res.status(403).send('Forbidden');
        return;
      }
      next();
    } catch (error) {
      res.status(500).send(`Error checking host role: ${error.message || error}`);
    }
  };
}

const authMiddleware = new AuthMiddleware();
export default authMiddleware;
