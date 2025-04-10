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
    POSTGRES_USERNAME: "shivam_g",
    POSTGRES_PASSWORD: "r6JYJ9!Mh2Kbwse",
    POSTGRES_DATABASE: "stage_rumor_23march",
    POSTGRES_PORT: "5432",
    POSTGRES_HOST: "174.129.171.83",

    FUSIONAUTH_API_KEY: 'kkPCb-JPN57xR2qW-5TrOYvCKGQf2l3lLxA33IuE0C4TKcgbQjzs9sJc',
    FUSIONAUTH_APP_ID: 'f10d52fa-5c27-4d4e-8605-7c2a83786ac1',
    FUSIONAUTH_BASE_URL: 'https://stag-therumor.fusionauth.io',
    FUSIONAUTH_CLIENT_SECRET: 'H6Wsx4Lss2corboRVH_NgwmWJhIoI8z6GJYkns1jS-0',
    FUSIONAUTH_GATEWAY_URI: 'https://stageapi.therumor.com',
    FUSIONAUTH_TENANT_ID: '1ba512b6-a725-4f0b-8b34-ad9ab2818e2b',
    USERS_SERVICE_BASE_URL: 'http://users:8000/users/v1',
    EVENTS_SERVICE_BASE_URL: 'http://events:8001/events/v1',
    NOTIFICATIONS_SERVICE_BASE_URL: 'http://notifications:8002/notifications/v1',
  },
};

export default config;
