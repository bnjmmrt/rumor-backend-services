const DomainError = require('./DomainError');

class InvalidActionError extends DomainError {
    constructor(message) {
        super(`Invalid action: ${message}`);
    }
}

module.exports = InvalidActionError;
