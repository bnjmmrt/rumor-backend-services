const DomainError = require('./DomainError');

class NotFoundEndpointError extends DomainError {
    constructor(path) {
        super(`Endpoint ${path} does not exist`);
    }
}

module.exports = NotFoundEndpointError;
