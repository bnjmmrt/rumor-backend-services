import { plainToInstance } from 'class-transformer';
import { validate as classValidate } from 'class-validator';
import { NotFoundError } from '../errors';
import DtoMap from './dto-map';

const parseErrors = (errors) => {
  const errorsObject = {};

  errors.forEach((err) => {
    const key = err.property;
    const messages = Object.values(err.constraints || {});
    errorsObject[key] = messages;
  });

  return Object.keys(errorsObject).map((field) => ({
    field,
    errors: errorsObject[field],
  }));
};

const validate = async (entity: string, method: string, data: object) => {
  const dtoEntry = DtoMap[entity]?.[method.toUpperCase()];

  if (!dtoEntry) {
    throw new NotFoundError(`No DTO found for ${entity} ${method}`);
  }

  const dtoInstance: object = plainToInstance(dtoEntry, data);
  const errors = await classValidate(dtoInstance, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });

  if (errors.length > 0) {
    return parseErrors(errors);
  }

  return null;
};

export default validate;
