import { Explorer } from "@frontend/chain";
import { BlockchainAddressType } from "../blockchain-address.types";

/**
 * Get the explorer URL for a given blockchain address.
 * @param explorer The explorer to use.
 * @param address The address to get the URL for.
 * @param type The type of address.
 * @returns The explorer URL.
 */
export function getExplorerUrl(explorer: Explorer, address: string, type: BlockchainAddressType): string {
    switch (type) {
        case "account":
            return explorer.getAddressUrl(address);
        case "transaction":
            return explorer.getTransactionUrl(address);
    }
}
