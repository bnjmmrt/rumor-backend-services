const DomainError = require('./DomainError');

class ActionFailedError extends DomainError {
    constructor(action, details, failures) {
        super(`Action '${action}' failed: ${details}`);
        this.data = failures;
    }
}

module.exports = ActionFailedError;
