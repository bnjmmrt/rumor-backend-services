const DomainError = require('./DomainError');

class MissingRequestParameterError extends DomainError {
    constructor(parameterType, parameterName) {
        super(`Missing request ${parameterType}: ${parameterName}`);
    }
}

module.exports = MissingRequestParameterError;
