const DomainError = require('./DomainError');

class NotFoundSubResourceError extends DomainError {
    constructor(resourceName, resourceId, subresourceName, subresourceId) {
        super(
            `Could not find ${subresourceName} '${subresourceId}' belonging to ${resourceName} '${resourceId}'`
        );
    }
}

module.exports = NotFoundSubResourceError;
