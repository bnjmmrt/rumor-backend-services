import { Request, Response, NextFunction } from "express";


class AuthMiddleware {
  fusionAuthRequired = (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.header("Authorization");
    if (!authorization) {
      return res.status(401).send("Unauthorized");
    }

    const tokenParts = authorization.split("Bearer ");
    if (tokenParts.length < 2) {
      return res.status(401).send("Unauthorized");
    }

    // Simulating token validation
    const userId = "mockUserId"; // Replace with actual token validation logic
    res.setHeader("userId", userId);
    (req as any).userId = userId;

    next();
  };

  checkPermission = (permission: string) => {
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
