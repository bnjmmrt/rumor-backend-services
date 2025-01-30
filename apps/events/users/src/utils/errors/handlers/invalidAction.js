const { InvalidActionError } = require('..');
const { generateErrorResponse, severityLevels } = require('./helpers');

const type = 'invalidAction';
const status = 400;
const severity = severityLevels.info;

const errors = [
    {
        instanceOf: error => error instanceof InvalidActionError,
        processError: ({ message, data }) => ({
            severity,
            status,
            errorResponse: generateErrorResponse({
                type,
                message
            })
        })
    }
];

module.exports = errors;
