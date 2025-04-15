import validate from 'rumor-utils/validation';
import { Request, Response, NextFunction } from 'express';

export const validateRequest = (entity: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = await validate(entity, req.method, req.body);

      if (errors) {
        res.status(400).json({ success: false, message: 'Validation Error', data: errors });
        return;
      }

      next();
    } catch (err) {
      console.error('Validation error:', err);
      res.status(500).json({ success: false, message: 'Internal Server Error - Validation' });
      return;
    }
  };
};
