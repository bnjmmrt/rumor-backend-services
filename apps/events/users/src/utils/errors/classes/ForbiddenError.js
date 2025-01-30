const DomainError = require('./DomainError');

class ForbiddenError extends DomainError {
    constructor(message) {
        super(`Forbidden: ${message}`);
    }
}

module.exports = ForbiddenError;
