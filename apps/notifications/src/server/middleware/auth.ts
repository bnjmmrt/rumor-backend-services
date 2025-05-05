import * as serviceMesh from 'rumor-utils/service-mesh';
import { Request, Response, NextFunction } from 'express';
import config from '../../config';
import apiService from 'rumor-utils/service-mesh';
import { AuthorizationError } from 'rumor-utils/errors';
import { RedirectionResponse } from 'rumor-utils/success';
class AuthMiddleware {
  static fusionAuthRequired = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authorization = req.header('Authorization');
      const requester = req.header('requester');

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
      apiService.initialize(config.get('USERS_SERVICE_BASE_URL'), token, { requester });

      const response = await serviceMesh.validate();

      if (!response || !response.data) {
        throw new AuthorizationError('Authorization Error');
      }

      if (response && response.data?.redirection) {
        res.status(206).json(new RedirectionResponse({ ...response.data }));
        return;
      }

      const userId = response.data;
      (req as any).user = userId;
      (req as any).token = token;

      next();
    } catch (error) {
      console.log('🚀 ~ AuthMiddleware ~ fusionAuthRequired= ~ error:', error);
      const errMsg = new AuthorizationError(`Session has expired, Please login again `);
      res.status(401).send(errMsg);
    }
  };

  static fusionAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authorization = req.header('Authorization');
      const requester = req.header('requester');

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
      apiService.initialize(config.get('USERS_SERVICE_BASE_URL'), token, { requester});

      const response = await serviceMesh.validate();

      if (!response || !response.data) {
        throw new AuthorizationError('Authorization Error');
      }

      if (response && response.data?.redirection) {
        res.status(206).json(new RedirectionResponse({ ...response.data }));
        return;
      }

      const userId = response.data;
      (req as any).user = userId;
      (req as any).token = token;

      next();
    } catch (error) {
      console.log('🚀 ~ AuthMiddleware ~ fusionAuthRequired= ~ error:', error);
      const errMsg = new AuthorizationError(`Session has expired, Please login again `);
      res.status(401).send(errMsg);
    }
  };
}

export default AuthMiddleware;
