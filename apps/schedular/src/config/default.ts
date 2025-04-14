const config = {
  parameters: [],
  secrets: [
    {
      remoteKey: '/local/dev',
    },
  ],
  values: {
    PORT: 8003,
    FILE_SIZE_IN_BYTES: '5000000',
    POSTGRES_USERNAME: "",
    POSTGRES_PASSWORD: "",
    POSTGRES_DATABASE: "",
    POSTGRES_PORT: "",
    POSTGRES_HOST: "",
    USERS_SERVICE_BASE_URL: 'http://users:8000/users/v1',
    EVENTS_SERVICE_BASE_URL: 'http://events:8001/events/v1',
    NOTIFICATIONS_SERVICE_BASE_URL: 'http://notifications:8002/notifications/v1',
  },
};

export default config;
