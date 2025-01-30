const DomainError = require('./DomainError');

class UnauthorizedError extends DomainError {
    constructor(message) {
        super(`Unauthorised: ${message}`);
    }
}

module.exports = UnauthorizedError;
