import { Request, Response, NextFunction } from 'express';
import config from '../../config';
import FusionAuthClient from '@fusionauth/typescript-client';
import { ValidateRequestDto } from 'rumor-utils/shared/users/dtos/auth.dto';
import { ForbiddenError, AuthorizationError } from 'rumor-utils/errors';
import { RoleService } from '../../services/role.service';
import { User } from 'rumor-utils/shared/entities';
import { UserStatus } from 'rumor-utils/shared/users/interfaces/shared.interface';
import { RedirectionResponse } from 'rumor-utils/success';

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

      if (!response || !response.userId) {
        res.status(401).send('Unauthorized');
        return;
      }

      (req as any).user = response.userId;
      (req as any).token = token;

      if (response.redirection) {
        let { redirection, redirectionRole } = response;
        res.status(206).json(new RedirectionResponse({ redirection, ...redirectionRole }));
        return;
      }

      next();
    } catch (error) {
      if (error instanceof ForbiddenError) {
        res.status(403).send('Forbidden Access');
        return;
      } else {
        const errMsg = new AuthorizationError(`Unauthorized Access, Please login again `);
        res.status(401).send(errMsg);
        return;
      }
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

      if (response.redirection) {
        let { redirection, redirectionRole } = response;
        res.status(206).json(new RedirectionResponse({ redirection, ...redirectionRole }));
        return;
      }

      next();
    } catch (error) {
      if (error instanceof ForbiddenError) {
        res.status(403).send('Forbidden Access');
        return;
      } else {
        const errMsg = new AuthorizationError(`Unauthorized Access, Please login again `);
        res.status(401).send(errMsg);
        return;
      }
    }
  };

  async validate({ token }: ValidateRequestDto): Promise<any> {
    try {
      const fusionAuthClient = new FusionAuthClient(
        config.get('FUSIONAUTH_API_KEY'),
        config.get('FUSIONAUTH_BASE_URL'),
      );
      const findUser = await fusionAuthClient.retrieveUserUsingJWT(token);

      if (!findUser?.response?.user?.active) {
        throw new AuthorizationError('User is not active');
      }

      const userDetails = await User.findOne({
        where: { email: findUser.response.user.email },
        relations: { roles: { role: true } },
      });

      let userSingleRole = userDetails?.roles?.length === 1;

      if (userSingleRole) {
        if (
          userDetails?.roles[0]?.role?.name === 'host' &&
          (userDetails?.roles[0]?.status === UserStatus.DEACTIVATED ||
          userDetails?.roles[0]?.isRoleDeactivated)
        ) {
          console.log('User is not active');
          throw new AuthorizationError('User is not active');
        } else if (
          (userDetails?.roles[0]?.role?.name === 'member' ||
            userDetails?.roles[0]?.role?.name === 'non_member') &&
          userDetails?.roles[0]?.isRoleDeactivated
        ) {
          throw new AuthorizationError('User is not active');
        } else {
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
            redirection: false,
          };
        }
      }

      const approvedHostUser = userDetails?.roles?.find(
        role => role.role.name === 'host' && role.status === UserStatus.ACTIVE,
      );

      const membeOrNonMemberUser = userDetails?.roles?.find(
        role => role.role.name === 'member' || role.role.name === 'non_member',
      );

      let redirection = false;
      let redirectionRole = {};

      if (approvedHostUser?.isRoleDeactivated && !membeOrNonMemberUser?.isRoleDeactivated) {
        redirection = true;
        redirectionRole = {
          name: membeOrNonMemberUser.role.name,
          status: membeOrNonMemberUser.status,
          id: membeOrNonMemberUser.role.id,
        };
      }

      if (!approvedHostUser?.isRoleDeactivated && membeOrNonMemberUser?.isRoleDeactivated) {
        redirection = true;
        redirectionRole = {
          name: approvedHostUser.role.name,
          status: approvedHostUser.status,
          id: approvedHostUser.role.id,
        };
      }

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
        redirection,
        redirectionRole,
      };
    } catch (err) {
      throw new ForbiddenError(err.statusCode);
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
