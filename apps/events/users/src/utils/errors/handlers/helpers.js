const generateErrorResponse = ({ type, message, data = [] }) => ({
    type,
    message,
    data
});

const severityLevels = {
    info: 'info',
    warning: 'warning',
    error: 'error'
};

const notifySeverityLevels = [severityLevels.warning, severityLevels.error];

module.exports = { generateErrorResponse, severityLevels, notifySeverityLevels };
