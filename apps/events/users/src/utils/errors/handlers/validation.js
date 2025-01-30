const { UniqueViolationError, NotNullViolationError } = require('objection');
const { convertCamelCaseToSentenceCase } = require('school-space-utils/string');
const { ValidationError } = require('..');
const { generateErrorResponse, severityLevels } = require('./helpers');

const type = 'validation';
const status = 400;
const severity = severityLevels.info;

const errors = [
    {
        instanceOf: error => error instanceof ValidationError,
        processError: ({ message, data }) => ({
            severity,
            status,
            errorResponse: generateErrorResponse({
                type,
                message,
                data
            })
        })
    },
    {
        instanceOf: error => error instanceof NotNullViolationError,
        processError: ({ column, table }) => ({
            severity: severityLevels.warning,
            status,
            errorResponse: generateErrorResponse({
                type,
                message: `Error validating ${convertCamelCaseToSentenceCase(table)}`,
                data: [
                    {
                        field: column,
                        errors: ['cannot be null']
                    }
                ]
            })
        })
    },
    {
        instanceOf: error => error instanceof UniqueViolationError,
        processError: ({ columns, table }) => ({
            severity: severityLevels.warning,
            status,
            errorResponse: generateErrorResponse({
                type,
                message: `Error validating ${convertCamelCaseToSentenceCase(table)}`,
                data: [
                    {
                        field: columns[0],
                        errors: ['must be unique']
                    }
                ]
            })
        })
    }
];

module.exports = errors;
