const UnauthorizedError = require('./classes/UnauthorizedError');
const ForbiddenError = require('./classes/ForbiddenError');

const AvailabilityError = require('./classes/AvailabilityError');
const ValidationError = require('./classes/ValidationError');
const InvalidRequestBodyError = require('./classes/InvalidRequestBodyError');
const MissingRequestParameterError = require('./classes/MissingRequestParameterError');

const NotFoundEndpointError = require('./classes/NotFoundEndpointError');
const NotFoundResourceError = require('./classes/NotFoundResourceError');
const NotFoundSubResourceError = require('./classes/NotFoundSubResourceError');

const ActionFailedError = require('./classes/ActionFailedError');
const ExternalServiceError = require('./classes/ExternalServiceError');
const InvalidActionError = require('./classes/InvalidActionError');
const ProgrammerError = require('./classes/ProgrammerError');
const XeroValidationError = require('./classes/XeroValidationError');

module.exports = {
    UnauthorizedError,
    ForbiddenError,
    AvailabilityError,
    ValidationError,
    InvalidActionError,
    InvalidRequestBodyError,
    MissingRequestParameterError,
    NotFoundEndpointError,
    NotFoundResourceError,
    NotFoundSubResourceError,
    ActionFailedError,
    ExternalServiceError,
    ProgrammerError,
    XeroValidationError
};
