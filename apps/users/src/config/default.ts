const config = {
  parameters: [],
  secrets: [
    {
      remoteKey: "/local/dev",
    },
  ],
  values: {
    domain: "",
    adminAppBaseUrl: "",
    HostAppBaseUrl: "",
    MemberAppBaseUrl: "",
    port: 8000,
    runMigrations: true,
    runSeeds: false,
    runTasks: false,
    logErrors: true,
    sendEmails: true,
    sendSupportTickets: false,
    POSTGRES_VERSION: "alpine",
    POSTGRES_USERNAME: "rumor",
    POSTGRES_PASSWORD: "rumor",
    POSTGRES_DATABASE: "rumor",
    POSTGRES_PORT: 5433,
    POSTGRES_HOST: "localhost",
  },
};

export default config;
