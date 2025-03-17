const config = {
    parameters: [],
    secrets: [
        {
            remoteKey: 'stage-rumor'
        }
    ],
    values: {
        PORT: 8001,
        NODE_ENV:'staging'
    }
};

export default config;