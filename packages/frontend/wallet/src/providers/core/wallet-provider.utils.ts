import { ITrustReceiptWalletProvider, ITrustTransferWalletProvider, IWalletProvider } from "./interfaces/i-wallet-provider";

/**
 * Checks if a wallet provider is a trust receipt wallet provider.
 * @param walletProvider The wallet provider to check.
 * @returns If the wallet provider is a trust receipt wallet provider.
 */
export function isTrustReceiptWalletProvider(walletProvider: IWalletProvider): walletProvider is ITrustReceiptWalletProvider {
    return "isTrustReceiptRequired" in walletProvider && "trustReceipt" in walletProvider && "isReceiptTrusted" in walletProvider;
}

/**
 * Checks if a wallet provider is a trust transfer wallet provider.
 * @param walletProvider The wallet provider to check.
 * @returns If the wallet provider is a trust transfer wallet provider.
 */
export function isTrustTransferWalletProvider(walletProvider: IWalletProvider): walletProvider is ITrustTransferWalletProvider {
    return "isTrustTransferRequired" in walletProvider && "trustTransfer" in walletProvider && "isTransferTrusted" in walletProvider;
}
