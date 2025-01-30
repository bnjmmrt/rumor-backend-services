const DomainError = require('./DomainError');

class ExternalServiceError extends DomainError {
    constructor(service, message, externalErrorData) {
        super(`Error from service ${service}: ${message}`);
        this.data = externalErrorData;
    }
}

module.exports = ExternalServiceError;
