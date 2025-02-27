import { Request, Response, NextFunction } from "express";
import { validate } from "rumor-utils/service-mesh";
import config from '../../config'


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
        const baseURL = config.get('API_BASE_URL');
        const token = tokenParts[1];

        const response = await validate(baseURL, token);

        if (!response || response.status !== 200 || !response.data.userId) {
            res.status(401).send("Unauthorized");
        }

        // Simulating token validation
        const userId = response.data.userId;
        (req as any).userId = userId;

        next();
    };

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
