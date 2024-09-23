import { buildConfig, validPort } from "@backend/config";

interface ServerConfig {
    port: number;
    enableSwagger: boolean;
    enableCors: boolean;
}

/**
 * Builds the server configuration.
 * @returns The server configuration.
 */
export default (): ServerConfig => {
    return buildConfig<ServerConfig>(
        {
            port: parseInt(process.env.APP_PORT!) || {
                default: 3000,
                development: 3001,
            },
            enableSwagger: {
                default: true,
                production: false,
            },
            enableCors: {
                default: true,
                production: false,
            },
        },
        {
            port: validPort,
        },
    );
};
