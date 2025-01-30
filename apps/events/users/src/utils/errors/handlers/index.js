const config = require('../../../config');
const { notifySeverityLevels } = require('./helpers');
const { getUser } = require('../../context');
const bugsnag = require('../../bugsnag');

const availabilityErrorHandlers = require('./availability');
const authErrorHandlers = require('./auth');
const defaultErrorHandler = require('./default');
const internalErrorHandlers = require('./internal');
const invalidRequestErrorHandlers = require('./invalidRequest');
const invalidActionErrorHandlers = require('./invalidAction');
const notFoundErrorHandlers = require('./notFound');
const validationErrorHandlers = require('./validation');

const errorHandlers = [
    ...authErrorHandlers,
    ...availabilityErrorHandlers,
    ...internalErrorHandlers,
    ...invalidActionErrorHandlers,
    ...invalidRequestErrorHandlers,
    ...notFoundErrorHandlers,
    ...validationErrorHandlers
];

const handleError = error => {
    const { processError } =
        errorHandlers.find(({ instanceOf }) => instanceOf(error)) || defaultErrorHandler;
    const { severity, status, errorResponse } = processError(error);

    if (config.get('logErrors')) {
        console.error(error);
    }

    if (notifySeverityLevels.includes(severity)) {
        const user = getUser();
        bugsnag.notify(error, {
            user: {
                id: user.id
            },
            metaData: {
                user: {
                    role: user.role
                },
                error: { ...error }
            },
            severity
        });
    }

    return { status, errorResponse };
};

module.exports = { handleError };
