const config = {
  parameters: [],
  secrets: [
    {
      remoteKey: '/local/dev',
    },
  ],
  values: {
    PORT: 8000,
    FILE_SIZE_IN_BYTES: '5000000',
    POSTGRES_USERNAME: process.env.POSTGRES_USERNAME,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    POSTGRES_DATABASE: process.env.POSTGRES_DATABASE,
    POSTGRES_PORT: process.env.POSTGRES_PORT,
    POSTGRES_HOST: process.env.POSTGRES_HOST,
    USERS_SERVICE_BASE_URL: 'http://users:8000/users/v1',
    EVENTS_SERVICE_BASE_URL: 'http://events:8001/events/v1',
    NOTIFICATIONS_SERVICE_BASE_URL: 'http://notifications:8002/notifications/v1',
    FUSIONAUTH_BASE_URL: 'https://dev-therumor.fusionauth.io/',
    FUSIONAUTH_API_KEY: '_kS2uGFPj6e8Zgok8EZp19nb0slcvhDTd8cgd7w8IpqqMh435OiiFDJt',
    FUSIONAUTH_APP_ID: '893861ee-03d9-4dc1-8a4b-3753900a804c',
    FUSIONAUTH_CLIENT_SECRET: 'u04tgIpCGSrZLuFp6YMyHcHSZpe1AuuUifKe16TaaBU',
    FUSIONAUTH_TENANT_ID: '8724d4e2-bcbd-428e-8953-ef22aa55dd00',
    FUSIONAUTH_GATEWAY_URI: 'https://devapi.therumor.com/',
  },
};

export default config;
