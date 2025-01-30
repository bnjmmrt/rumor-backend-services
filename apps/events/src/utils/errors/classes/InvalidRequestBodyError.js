const DomainError = require('./DomainError');

class InvalidRequestBodyError extends DomainError {
    constructor(message) {
        super(`Invalid request body: ${message}`);
    }
}

module.exports = InvalidRequestBodyError;
