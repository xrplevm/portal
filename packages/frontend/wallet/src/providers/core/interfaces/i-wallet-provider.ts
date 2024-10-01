import { WalletProviderConnectionError, WalletProviderId } from "../../types";
import { EventEmitter } from "@frontend/events";
import { Chain } from "@frontend/chain";
import { Token } from "@frontend/token";
import { Transaction, Unconfirmed } from "@shared/modules/blockchain";
import { ChainType } from "@shared/modules/chain";

export type WalletProviderEvents = {
    setChain: (chain: Chain | undefined) => void;
    connect: (address: string) => void;
    disconnect: () => void;
    connectionError: (error: WalletProviderConnectionError, message: string) => void;
};

export interface IWalletProvider {
    providerId: WalletProviderId;
    type: ChainType;
    address: string;
    /**
     * Adds a listener for the specified event.
     * @param event The event to listen to.
     * @param listener The listener to add.
     * @returns The listener function.
     */
    on: EventEmitter<WalletProviderEvents>["on"];
    /**
     * Transfers an amount of a token to a destination address on a destination chain.
     * @param amount The amount to transfer.
     * @param token The token to transfer.
     * @param destinationChain The destination chain.
     * @param destinationAddress The destination address.
     */
    transfer(amount: string, token: Token, destinationChain: Chain, destinationAddress: string): Promise<Unconfirmed<Transaction>>;
}

export interface ITrustReceiptWalletProvider extends IWalletProvider {
    /**
     * Checks if a trust receipt is required for a token.
     * @param token The token to check.
     * @returns If a trust receipt is required.
     */
    isTrustReceiptRequired(token: Token): boolean;
    /**
     * Trusts a receipt for a token.
     * @param token The token to trust.
     * @param amount The amount to receive.
     * @returns The unconfirmed trust receipt transaction.
     */
    trustReceipt(token: Token, amount: string): Promise<Unconfirmed<Transaction>>;
    /**
     * Checks if a receipt is trusted for a token.
     * @param token The token to check.
     * @returns If the receipt is trusted.
     */
    isReceiptTrusted(token: Token): Promise<boolean>;
}

export interface ITrustTransferWalletProvider extends IWalletProvider {
    /**
     * Checks if a trust transfer is required for a token.
     * @param token The token to check.
     * @returns If a trust transfer is required.
     */
    isTrustTransferRequired(token: Token): boolean;
    /**
     * Trusts a transfer for a token.
     * @param token The token to trust.
     * @param amount The amount to transfer.
     * @returns The unconfirmed trust commit transaction.
     */
    trustTransfer(token: Token, amount: string): Promise<Unconfirmed<Transaction>>;
    /**
     * Checks if a transfer is trusted for a token.
     * @param token The token to check.
     * @returns If the transfer is trusted.
     */
    isTransferTrusted(token: Token): Promise<boolean>;
}
