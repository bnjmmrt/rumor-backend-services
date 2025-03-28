const config = {
  parameters: [],
  secrets: [
    {
      remoteKey: '/local/dev',
    },
  ],
  values: {
    PORT: 8000,
    POSTGRES_USERNAME: process.env.POSTGRES_USERNAME,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    POSTGRES_DATABASE: process.env.POSTGRES_DATABASE,
    POSTGRES_PORT: process.env.POSTGRES_PORT,
    POSTGRES_HOST: process.env.POSTGRES_HOST,
    USERS_SERVICE_BASE_URL: 'http://users:8000/users/v1',
    EVENTS_SERVICE_BASE_URL: 'http://events:8001/events/v1',
    NOTIFICATIONS_SERVICE_BASE_URL: 'http://notifications:8002/notifications/v1',
    FUSIONAUTH_API_KEY: 'kkPCb-JPN57xR2qW-5TrOYvCKGQf2l3lLxA33IuE0C4TKcgbQjzs9sJc',
    FUSIONAUTH_APP_ID: 'afc49437-467d-4a76-9864-84ce47f31fa0',
    FUSIONAUTH_BASE_URL: 'https://stag-therumor.fusionauth.io',
    FUSIONAUTH_CLIENT_SECRET: 'nqVoSXFggZwEQZ5c91agPK6XvgTspNoVDUCd0nyt-xU',
    FUSIONAUTH_GATEWAY_URI: 'https://stageapi.therumor.com',
    FUSIONAUTH_TENANT_ID: '23f61ed1-58ec-40e5-849c-83f213318542',
    DEFAULT_SEND_EMAIL: 'support@therumor.com',
    SENDGRID_API_KEY: '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'
  },
};

export default config;
