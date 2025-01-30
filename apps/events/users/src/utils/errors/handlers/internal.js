const {
    ValidationError: ObjectionValidationError,
    ForeignKeyViolationError,
    CheckViolationError,
    DataError
} = require('objection');
const { generateErrorResponse, severityLevels } = require('./helpers');
const {
    ProgrammerError,
    ExternalServiceError,
    XeroValidationError,
    ActionFailedError
} = require('..');

const type = 'internal';
const status = 500;
const severity = severityLevels.error;

const handlers = [
    {
        instanceOf: error =>
            error instanceof ExternalServiceError ||
            error instanceof ProgrammerError ||
            error instanceof XeroValidationError ||
            error instanceof ObjectionValidationError ||
            error instanceof CheckViolationError ||
            error instanceof ForeignKeyViolationError ||
            error instanceof DataError,
        processError: () => ({
            severity,
            status,
            errorResponse: generateErrorResponse({
                type,
                message: 'Internal server error'
            })
        })
    },
    {
        instanceOf: error => error instanceof ActionFailedError,
        processError: ({ message, data }) => ({
            severity,
            status,
            errorResponse: generateErrorResponse({
                type: 'actionFailed',
                message,
                data
            })
        })
    }
];

module.exports = handlers;
