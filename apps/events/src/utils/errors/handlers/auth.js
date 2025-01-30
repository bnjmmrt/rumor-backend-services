const { UnauthorizedError: ExpressJwtUnauthorizedError } = require('express-jwt');
const { ForbiddenError, UnauthorizedError } = require('..');
const { generateErrorResponse, severityLevels } = require('./helpers');

const type = 'auth';

const handlers = [
    {
        instanceOf: error => error instanceof ExpressJwtUnauthorizedError,
        processError: error => ({
            severity: severityLevels.info,
            status: 401,
            errorResponse: generateErrorResponse({
                type,
                message: 'Unauthorised: Invalid or missing token'
            })
        })
    },
    {
        instanceOf: error => error instanceof UnauthorizedError,
        processError: ({ message }) => ({
            severity: severityLevels.warning,
            status: 401,
            errorResponse: generateErrorResponse({
                type,
                message
            })
        })
    },
    {
        instanceOf: error => error instanceof ForbiddenError,
        processError: ({ message }) => ({
            severity: severityLevels.warning,
            status: 403,
            errorResponse: generateErrorResponse({
                type,
                message
            })
        })
    }
];

module.exports = handlers;
