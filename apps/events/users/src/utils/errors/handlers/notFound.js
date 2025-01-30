const { NotFoundEndpointError, NotFoundResourceError, NotFoundSubResourceError } = require('..');
const { generateErrorResponse, severityLevels } = require('./helpers');

const type = 'notFound';
const status = 404;

const handlers = [
    {
        instanceOf: error => error instanceof NotFoundEndpointError,
        processError: ({ message }) => ({
            severity: severityLevels.info,
            status,
            errorResponse: generateErrorResponse({
                type,
                message
            })
        })
    },
    {
        instanceOf: error =>
            error instanceof NotFoundResourceError || error instanceof NotFoundSubResourceError,
        processError: ({ message }) => ({
            severity: severityLevels.warning,
            status,
            errorResponse: generateErrorResponse({
                type,
                message
            })
        })
    }
];

module.exports = handlers;
