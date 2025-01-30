const { InvalidRequestBodyError, MissingRequestParameterError } = require('..');
const { generateErrorResponse, severityLevels } = require('./helpers');

const type = 'invalidRequest';
const status = 400;
const severity = severityLevels.info;

const errors = [
    {
        instanceOf: error =>
            error instanceof InvalidRequestBodyError ||
            error instanceof MissingRequestParameterError,
        processError: ({ message, data }) => ({
            severity,
            status,
            errorResponse: generateErrorResponse({
                type,
                message,
                data
            })
        })
    }
];

module.exports = errors;
