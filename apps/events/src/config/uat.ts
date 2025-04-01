const config = {
  parameters: [],
  secrets: [
    {
      remoteKey: 'uat-rumor',
    },
  ],
  values: {
    PORT: 8001,
    NODE_ENV: 'uat',
  },
};

export default config;
