const { job } = require('cron');

const task = config =>
    job({
        ...config,
        timezone: 'Europe/London'
    });

module.exports = task;
