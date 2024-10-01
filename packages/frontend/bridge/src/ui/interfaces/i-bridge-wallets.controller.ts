import { BridgeSource } from "xchain-sdk";
import { IWalletProvider } from "@frontend/wallet/providers/interfaces";
import { WalletProviderId } from "@frontend/wallet/providers";
import { BridgeWallet, BridgeWalletPair } from "../../common/types/bridge-wallet.types";

export interface IBridgeWalletsController {
    getOriginWalletProvider(): IWalletProvider;
    getDestinationWalletProvider(): IWalletProvider;
    requestOriginWalletConnection(providerId: WalletProviderId): Promise<IWalletProvider>;
    requestDestinationWalletConnection(providerId: WalletProviderId): Promise<IWalletProvider>;
    disconnectOriginWallet(): void;
    disconnectDestinationWallet(): void;
    disconnectWallet(side: BridgeSource): void;
    swap(): void;
    getOriginWallet(): BridgeWallet;
    getDestinationWallet(): BridgeWallet;
    getBridgeWallets(): BridgeWalletPair;
}
