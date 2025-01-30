const { convertCamelCaseToSentenceCase } = require('school-space-utils/string');
const DomainError = require('./DomainError');

class ValidationError extends DomainError {
    constructor(entity, validationError) {
        super(`Error validating ${convertCamelCaseToSentenceCase(entity)}`);
        this.data = validationError;
    }
}

module.exports = ValidationError;
