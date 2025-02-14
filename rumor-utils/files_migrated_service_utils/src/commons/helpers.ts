import { Request, Response, NextFunction } from 'express';

export const generateUniqueFileName = (type: string) => {
  const now = new Date().toISOString();
  const cleanNow = now.replace(/[\W_]+/g, '');
  const random = Math.floor(Math.random() * 10000);
  const fileName = `${cleanNow}-${random}.${type}`;
  return fileName;
};


export const errorHandlerWrapper = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next); // Forward errors to the Express error handler
  };
};
