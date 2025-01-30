import { SecretsManager } from 'aws-sdk';

const secretManager = new SecretsManager({region: 'us-east-1'});

const getSecret = async (secretName: string) =>
    secretManager
        .getSecretValue({ SecretId: secretName })
        .promise()
        .then((data: any) => {
            console.log("🚀 ~ .then ~ data:", JSON.parse(data.SecretString))
            return JSON.parse(data.SecretString);
        })
        .catch((err: any) => {
            console.error(`[AWS] Error fetching secret ${secretName} from AWS`, err);
            throw err;
        });

export default getSecret

