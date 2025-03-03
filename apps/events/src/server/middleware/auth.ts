import * as serviceMesh from 'rumor-utils/service-mesh';
import { Request, Response, NextFunction } from 'express';
import config from '../../config';

class AuthMiddleware {
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
        
        const response = await serviceMesh.validate(config.get('USERS_SERVICE_BASE_URL'), token)
        console.log("🚀 ~ AuthMiddleware ~ fusionAuthRequired= ~ response:", response)

        if (!response || response.status !== 200 || !response.data.userId) {
            res.status(401).send("Unauthorized");
        }

        // Simulating token validation
        const userId = response.data.userId;
        (req as any).userId = userId;

        next();
    };
}

export default AuthMiddleware;