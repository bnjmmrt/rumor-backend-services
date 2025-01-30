const { generateErrorResponse, severityLevels } = require('./helpers');

const defaultHandler = {
    processError: () => ({
        severity: severityLevels.error,
        status: 500,
        errorResponse: generateErrorResponse({
            type: 'internal',
            message: 'Internal server error'
        })
    })
};

module.exports = defaultHandler;
