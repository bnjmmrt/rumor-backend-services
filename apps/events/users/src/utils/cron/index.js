const bookingTasks = require('../../services/bookings/tasks');
const reportsTasks = require('../../services/reports/tasks');

const start = async () => {
    console.info('[CRON] Registering cron jobs...');

    const tasks = [...bookingTasks, ...reportsTasks];
    try {
        tasks.map(task => task.start());
        console.info(`[CRON] Registered ${tasks.length} cron jobs ⏰`);
    } catch (error) {
        console.error('[CRON] Failed registering cron jobs.', error);
        throw error;
    }
};

module.exports = { start };
