import { buildConfig } from "@backend/config";

interface AxelarConfig {
    rpcUrl: string;
    chainId: string;
    verifyWaitTime: number;
    proveWaitTime: number;
    externalRelayWaitTime: number;
    privateKey: string;
    externalRelayedChains: string[];
    chainWebsockets: Record<string, string>;
    supportedChains: string[];
    itsGasLimit: number;
}

/**
 * Builds the logger configuration.
 * @param secrets The AWS secrets.
 * @returns The logger configuration.
 */
export default (secrets: Record<any, any>): AxelarConfig => {
    return buildConfig<AxelarConfig>({
        rpcUrl: secrets.AXELAR_RPC_URL || "http://devnet-amplifier.axelar.dev:26657",
        chainId: secrets.AXELAR_CHAIN_ID || "devnet-amplifier",
        externalRelayWaitTime: Number(secrets.AXELAR_EXTERNAL_RELAY_WAIT_TIME) || 15_000,
        verifyWaitTime: Number(secrets.AXELAR_VERIFY_WAIT_TIME) || 15_000,
        proveWaitTime: Number(secrets.AXELAR_PROVE_WAIT_TIME) || 15_000,
        privateKey: secrets.AXELAR_PRIVATE_KEY || "5b726ed6e1d4fdeec6ec7526d71c96218f6ebe4d7b10928732c49a242dd6bea9",
        externalRelayedChains: secrets.AXELAR_EXTERNAL_RELAYED_CHAINS || ["avalanche-fuji"],
        chainWebsockets: secrets.AXELAR_CHAIN_WEBSOCKETS || {
            "avalanche-fuji": "wss://api.avax-test.network/ext/bc/C/ws",
            "xrpl-evm-sidechain": "ws://168.119.63.112:8546",
        },
        supportedChains: secrets.AXELAR_SUPPORTED_CHAINS || ["avalanche-fuji"],
        itsGasLimit: Number(secrets.AXELAR_ITS_GAS_LIMIT) || 8000000,
    });
};
