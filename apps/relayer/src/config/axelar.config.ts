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
    tokenIds: Record<string, string>;
}

/**
 * Builds the logger configuration.
 * @returns The logger configuration.
 */
export default (): AxelarConfig => {
    return buildConfig<AxelarConfig>({
        rpcUrl: process.env.AXELAR_RPC_URL || "http://devnet-amplifier.axelar.dev:26657",
        chainId: process.env.AXELAR_CHAIN_ID || "devnet-amplifier",
        externalRelayWaitTime: Number(process.env.AXELAR_EXTERNAL_RELAY_WAIT_TIME) || 15_000,
        verifyWaitTime: Number(process.env.AXELAR_VERIFY_WAIT_TIME) || 15_000,
        proveWaitTime: Number(process.env.AXELAR_PROVE_WAIT_TIME) || 15_000,
        privateKey: process.env.AXELAR_PRIVATE_KEY || "5b726ed6e1d4fdeec6ec7526d71c96218f6ebe4d7b10928732c49a242dd6bea9",
        externalRelayedChains: ["avalanche-fuji"],
        chainWebsockets: {
            "avalanche-fuji": "wss://api.avax-test.network/ext/bc/C/ws",
            "xrpl-evm-sidechain": "ws://168.119.63.112:8546",
            xrpl: "wss://s.devnet.rippletest.net:51233",
        },
        supportedChains: ["xrpl-evm-sidechain"],
        itsGasLimit: Number(process.env.AXELAR_ITS_GAS_LIMIT) || 8000000,
        tokenIds: {
            xrpl: process.env.XRPL_TOKEN_ID || "0xc2bb311dd03a93be4b74d3b4ab8612241c4dd1fd0232467c54a03b064f8583b6",
        },
    });
};
