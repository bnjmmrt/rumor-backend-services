const config = {
  parameters: [],
  secrets: [
    {
      remoteKey: '/local/dev',
    },
  ],
  values: {
    PORT: 8001,
    POSTGRES_USERNAME: process.env.POSTGRES_USERNAME,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    POSTGRES_DATABASE: process.env.POSTGRES_DATABASE,
    POSTGRES_PORT: process.env.POSTGRES_PORT,
    POSTGRES_HOST: process.env.POSTGRES_HOST,
    USERS_SERVICE_BASE_URL: 'http://users:8000/users/v1',
    EVENTS_SERVICE_BASE_URL: 'http://events:8001/events/v1/v2',
    NOTIFICATIONS_SERVICE_BASE_URL: 'http://notifications:8002/notifications/v1',
  },
};

export default config;
