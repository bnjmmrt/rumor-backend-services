const config = {
  parameters: [],
  secrets: [
    {
      remoteKey: '/local/dev',
    },
  ],
  values: {
    PORT: 8001,
    

    POSTGRES_USERNAME: "shivam_g",
    POSTGRES_PASSWORD: "r6JYJ9!Mh2Kbwse",
    POSTGRES_DATABASE: "stage_rumor_23march",
    POSTGRES_PORT: "5432",
    POSTGRES_HOST: "174.129.171.83",

    USERS_SERVICE_BASE_URL: 'http://users:8000/users/v1',
    EVENTS_SERVICE_BASE_URL: 'http://events:8001/events/v1/v2',
    NOTIFICATIONS_SERVICE_BASE_URL: 'http://notifications:8002/notifications/v1',
  },
};

export default config;
