import { useBridgeExplorer } from "@frontend/bridge/ui/hooks";
import { BridgeBlockchainAddressType } from "../bridge-blockchain-address.types";

/**
 * Gets the explorer url for the given address and type.
 * @param address The address to get the explorer url for.
 * @param type The type of explorer url to get.
 * @returns The explorer url for the given address and type.
 */
export function useGetBridgeExplorerUrl(address: string, type: BridgeBlockchainAddressType): string {
    const bridgeExplorer = useBridgeExplorer();

    switch (type) {
        case "transfer":
            return bridgeExplorer.getTransferUrl(address);
    }
}
