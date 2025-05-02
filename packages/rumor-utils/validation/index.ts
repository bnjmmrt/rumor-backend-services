import { plainToInstance } from 'class-transformer';
import { validate as classValidate, ValidationError } from 'class-validator';
import { NotFoundError } from '../errors';
import DtoMap from './dto-map';

// const parseErrors = errors => {
//   const errorsObject = {};

//   errors.forEach(err => {
//     const key = err.property;
//     const messages = Object.values(err.constraints || {});
//     errorsObject[key] = messages;
//   });

//   return Object.keys(errorsObject).map(field => ({
//     field,
//     errors: errorsObject[field],
//   }));
// };

const parseErrors = (
  errors: ValidationError[],
  parentPath = '',
): { field: string; errors: string[] }[] => {
  const result: { field: string; errors: string[] }[] = [];
  for (const error of errors) {
    const fieldPath = parentPath ? `${parentPath}.${error.property}` : error.property;
    if (error.constraints) {
      result.push({ field: fieldPath, errors: Object.values(error.constraints) });
    }
    if (error.children && error.children.length > 0) {
      result.push(...parseErrors(error.children, fieldPath));
    }
  }
  return result;
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
