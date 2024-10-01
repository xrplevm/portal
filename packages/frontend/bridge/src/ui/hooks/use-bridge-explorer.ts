import { useConfig } from "@frontend/config/react";
import { BridgeExplorer } from "../../common/bridge-explorer";

/**
 * Get the bridge explorer.
 * @returns The bridge explorer.
 */
export function useBridgeExplorer(): BridgeExplorer {
    const config = useConfig();

    return new BridgeExplorer(config.bridgeExplorer);
}
