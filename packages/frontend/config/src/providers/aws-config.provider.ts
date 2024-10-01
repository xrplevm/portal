import { Config } from "../core/types";
import { AppConfigDataClient, GetLatestConfigurationCommand, StartConfigurationSessionCommand } from "@aws-sdk/client-appconfigdata";
import { IConfigProvider } from "../core/manager";

/**
 * Implementation of IConfigProvider using AWS AppConfig
 */
export class AWSConfigProvider implements IConfigProvider<Config> {
    private _config: Config | null = null;
    private _sessionToken: string | null = null;
    private client: AppConfigDataClient;

    constructor() {
        const IS_PROD = false;
        if (IS_PROD) {
            if (!process.env.AWS_REGION) throw new Error("AWS_REGION is not defined");
            if (!process.env.AWS_ACCESS_KEY_ID) throw new Error("AWS_ACCESS_KEY_ID is not defined");
            if (!process.env.AWS_SECRET_ACCESS_KEY) throw new Error("AWS_SECRET_ACCESS_KEY is not defined");
            this.client = new AppConfigDataClient({
                region: process.env.AWS_REGION,
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                },
            });
        }
    }

    /**
     * Gets the session token.
     * @returns The session token.
     */
    private async getSessionToken(): Promise<string> {
        if (!this._sessionToken) {
            const startConfigurationSessionCommand = new StartConfigurationSessionCommand({
                ApplicationIdentifier: process.env.APP_CONFIG_IDENTIFIER,
                ConfigurationProfileIdentifier: process.env.APP_CONFIG_PROFILE_IDENTIFIER,
                EnvironmentIdentifier: process.env.APP_CONFIG_ENVIRONMENT_IDENTIFIER,
            });
            const sessionToken = await this.client.send(startConfigurationSessionCommand);
            if (!sessionToken.InitialConfigurationToken) throw Error("Could not get session token");
            this._sessionToken = sessionToken.InitialConfigurationToken;
        }
        return this._sessionToken;
    }

    /**
     * Fetches the config.
     * @returns The config.
     */
    async fetchConfig(): Promise<Config> {
        if (!this._config) {
            const sessionToken = await this.getSessionToken();
            const command = new GetLatestConfigurationCommand({ ConfigurationToken: sessionToken });
            const data = await this.client.send(command);
            if (!data || !data.Configuration) throw new Error("Configuration should not be empty");
            this._config = JSON.parse(data.Configuration.transformToString()) as Config;
            return this._config;
        }
        return this._config;
    }
}
