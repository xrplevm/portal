import { AwsSecrets, buildConfig } from "@backend/config";

interface AwsS3Config {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
}

/**
 * Builds the AWS S3 configuration.
 * @param secrets The AWS secrets.
 * @returns The AWS S3 configuration.
 */
export default (secrets: AwsSecrets): AwsS3Config => {
    return buildConfig<AwsS3Config>({
        region: {
            default: process.env.AWS_S3_REGION || secrets.AWS_S3_REGION,
        },
        accessKeyId: {
            default: process.env.AWS_S3_ACCESS_KEY_ID || secrets.AWS_S3_ACCESS_KEY_ID,
        },
        secretAccessKey: {
            default: process.env.AWS_S3_SECRET_ACCESS_KEY || secrets.AWS_S3_SECRET_ACCESS_KEY,
        },
        bucketName: {
            default: process.env.AWS_S3_BUCKET_NAME || secrets.AWS_S3_BUCKET_NAME,
        },
    });
};
