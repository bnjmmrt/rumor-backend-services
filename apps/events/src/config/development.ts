const config = {
    parameters: [],
    secrets: [
        {
            remoteKey: '/local/dev'
        }
    ],
    values: {
        domain: '',
        adminAppBaseUrl: '',
        HostAppBaseUrl: '',
        MemberAppBaseUrl: '',
        port: 8001,
        runMigrations: true,
        runSeeds: false,
        runTasks: false,
        logErrors: true,
        sendEmails: true,
        sendSupportTickets: false
    }
};

export default config;

