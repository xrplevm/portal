import { ThemeKey } from "@frontend/design-system-core/themes";
import { BaseConfig } from "./manager";
import { PollingOptions } from "@peersyst/react-utils/@types/polling";
import { ChainType } from "xchain-sdk";
import { WalletProviderDef, WalletProviderId } from "@frontend/wallet/providers";
import { AnyObject } from "@swisstype/essential";

export interface CoreConfig extends BaseConfig {
    projectName: string;
    publicUrl: string;
    backendUrl: string;
    theme: ThemeKey;
    maxNumberDecimals: number;
    txValidationPolling: PollingOptions;
    peersystUrl: string;
    axelarUrl: string;
    walletProviders: Record<WalletProviderId, WalletProviderDef>;
    balanceRefetchInterval: number;
    posthog: {
        apiKey: string;
        host: string;
    };
    footerLinks: {
        discord: string;
        x: string;
        featureRequest: string;
    };
    axelar: {
        url: string;
        apiUrl: string;
        interchainTokenServiceContract: string;
        chainIds: Record<string, boolean>;
        // Map of chainId to axelar chain object.
        additionalChainData: Record<string, AnyObject>;
        // Extra axelar chain objects to be added to the chain list.
        extraChains: AnyObject[];
        // Map of tokenId to axelar interchain token object.
        additionalTokenData: Record<string, AnyObject>;
        // Extra axelar interchain token objects to be added to the token list.
        extraTokens: AnyObject[];
    };
    bridgeExplorer: {
        name: string;
        url: string;
        icon: string;
        transferPath: string;
    };

    xumm: {
        statusInterval: number;
        maxNumberOfRetries: number;
    };
    destinationCanReceiveRefetchInterval: number;
    destinationIsActiveRefetchInterval: number;
    explorerPaths: Record<ChainType, { account: string; transaction: string }>;
    attestationsPolling: PollingOptions;
}
export interface Config extends CoreConfig {}

export type StaticConfig = Omit<Config, "minVersion">;

export type ProviderConfig = Omit<Config, "version">;
