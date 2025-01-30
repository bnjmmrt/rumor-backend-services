const { AvailabilityError } = require('..');
const { generateErrorResponse, severityLevels } = require('./helpers');

const type = 'availability';
const status = 400;
const severity = severityLevels.info;

const errors = [
    {
        instanceOf: error => error instanceof AvailabilityError,
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
