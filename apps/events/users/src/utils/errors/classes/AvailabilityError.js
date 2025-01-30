const { formatToHoursMinutes } = require('school-space-utils/time');

const DomainError = require('./DomainError');

class AvailabilityError extends DomainError {
    constructor(space, startTime, endTime, clashes) {
        super(
            `${space} is unavailable between ${formatToHoursMinutes(
                startTime
            )} and ${formatToHoursMinutes(endTime)}`
        );
        this.data = clashes;
    }
}

module.exports = AvailabilityError;
