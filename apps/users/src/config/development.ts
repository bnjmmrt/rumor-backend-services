const config = {
    parameters: [],
    secrets: [
        {
            remoteKey: 'dev-rumor'
        }
    ],
    values: {
        domain: '',
        adminAppBaseUrl: '',
        HostAppBaseUrl: '',
        MemberAppBaseUrl: '',
        port: 8000,
        runMigrations: true,
        runSeeds: false,
        runTasks: false,
        logErrors: true,
        sendEmails: true,
        sendSupportTickets: false
    }
};

export default config;

