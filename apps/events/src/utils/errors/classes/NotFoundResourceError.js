const DomainError = require('./DomainError');

class NotFoundResourceError extends DomainError {
    constructor(resource, identifierName, identifier) {
        super(`Resource '${resource}' with ${identifierName} '${identifier}' does not exist`);
    }
}

module.exports = NotFoundResourceError;
