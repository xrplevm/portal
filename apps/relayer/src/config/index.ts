import serverConfig from "./server.config";
import axelarConfig from "./axelar.config";
import loggerConfig from "./logger.config";
import { loadAwsSecrets } from "@backend/config";
import awsS3Config from "./aws-s3.config";

/**
 * Builds the application configuration.
 * @returns The application configuration.
 */
export default async (): Promise<any> => {
    const secrets = await loadAwsSecrets(process.env.AWS_REGION || "", process.env.AWS_SECRET_ID || "");
    return {
        server: serverConfig(),
        axelar: axelarConfig(secrets),
        logger: loggerConfig(),
        awsS3: awsS3Config(secrets),
    };
};
