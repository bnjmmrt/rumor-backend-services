import {
  BaseError,
  AuthorizationError,
  InternalServerError,
  NotFoundError,
  ValidationError,
} from '../errors';

export const handleSuccessResponse = ({ data }) => data;

const handleApiError = ({
  response: {
    data: { type, message, data },
  },
}) => {
  switch (type) {
    case 'auth':
      return new AuthorizationError(message);
    case 'actionFailed':
      return new InternalServerError(message);
    case 'invalidRequest':
      return new InternalServerError(message);
    case 'notFound':
      return new NotFoundError(message);
    case 'validation':
      return new ValidationError(message, data);
    default:
      return new BaseError(message);
  }
};

export const handleErrorResponse = error => {
  if (error.response) {
    return Promise.reject(handleApiError(error));
  }

  return Promise.reject(error);
};
