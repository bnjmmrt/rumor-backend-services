const config = {
    parameters: [],
    secrets: [
        {
            remoteKey: "/local/dev"
        }
    ],
    values: {    
        PORT: 8002,
        POSTGRES_USERNAME: process.env.POSTGRES_USERNAME,
        POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
        POSTGRES_DATABASE: process.env.POSTGRES_DATABASE,
        POSTGRES_PORT: process.env.POSTGRES_PORT,
        POSTGRES_HOST: process.env.POSTGRES_HOST
    }
};

export default config