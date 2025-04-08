const config = {
  parameters: [],
  secrets: [
    {
      remoteKey: 'prod-rumor-secrets',
    },
  ],
  values: {
    PORT: 8001,
    NODE_ENV: 'production',
  },
};

export default config;
