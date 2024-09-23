import { buildConfig } from "@backend/config";

interface AxelarConfig {
    rpcUrl: string;
    chainId: string;
    verifyWaitTime: number;
    proveWaitTime: number;
    privateKey: string;
}

/**
 * Builds the logger configuration.
 * @returns The logger configuration.
 */
export default (): AxelarConfig => {
    return buildConfig<AxelarConfig>({
        rpcUrl: "http://devnet-amplifier.axelar.dev:26657",
        chainId: "devnet-amplifier",
        verifyWaitTime: 9_000,
        proveWaitTime: 9_000,
        privateKey: "022bfeaa81eed7d52f500990cac50e8d3561a89795e9a1121d25d1299edd0e9c",
    });
};
