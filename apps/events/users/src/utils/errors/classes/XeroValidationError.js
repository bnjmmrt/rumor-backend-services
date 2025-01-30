const DomainError = require('./DomainError');

class XeroValidationError extends DomainError {
    constructor(resource, identifier, validationErrors) {
        super(`Error creating ${resource} in Xero for ${identifier}`);
        this.data = validationErrors.map(error => error.Message).join(' ');
    }
}

module.exports = XeroValidationError;
