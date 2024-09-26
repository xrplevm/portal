import serverConfig from "./server.config";
import axelarConfig from "./axelar.config";
import loggerConfig from "./logger.config";

/**
 * Builds the application configuration.
 * @returns The application configuration.
 */
export default async (): Promise<any> => {
    return {
        server: serverConfig(),
        axelar: axelarConfig(),
        logger: loggerConfig(),
    };
};
