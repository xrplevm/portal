import { getInstance } from "@frontend/core/common/utils/singleton";
import { IWalletProvider } from "@frontend/wallet/providers/interfaces";
import { BridgeSource } from "xchain-sdk";
import { BridgeWalletsController } from "../../domain/controllers/bridge-wallets/bridge-wallets.controller";

/**
 * Get the wallet provider for the given bridge source.
 * @param side The bridge source to get the wallet provider for.
 * @returns The wallet provider for the given bridge source.
 */
export function getWalletSourceProvider(side: BridgeSource): IWalletProvider {
    return side === BridgeSource.ORIGIN
        ? getInstance(BridgeWalletsController).getOriginWalletProvider()
        : getInstance(BridgeWalletsController).getDestinationWalletProvider();
}
