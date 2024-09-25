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
}

/**
 * Builds the logger configuration.
 * @returns The logger configuration.
 */
export default (): AxelarConfig => {
    return buildConfig<AxelarConfig>({
        rpcUrl: "http://devnet-amplifier.axelar.dev:26657",
        chainId: "devnet-amplifier",
        externalRelayWaitTime: 9_000,
        verifyWaitTime: 9_000,
        proveWaitTime: 9_000,
        privateKey: "5b726ed6e1d4fdeec6ec7526d71c96218f6ebe4d7b10928732c49a242dd6bea9",
        externalRelayedChains: ["avalanche-fuji"],
        chainWebsockets: {
            "avalanche-fuji": "wss://api.avax-test.network/ext/bc/C/ws",
            "xrpl-evm-sidechain": "wss://ws.xrplevm.org",
        },
        supportedChains: ["xrpl-evm-sidechain", "avalanche-fuji"],
    });
};
