import { Chain } from "@frontend/chain";
import { Token } from "@frontend/token";
import { Transaction, Unconfirmed } from "@shared/modules/blockchain";

export interface IWalletProviderSigner {
    /**
     * Gets the wallet address.
     * @returns The wallet address.
     */
    getAddress(): Promise<string>;

    /**
     * Transfers a token to the specified destination chain and address.
     * @param amount The amount to transfer.
     * @param token The token to transfer.
     * @param doorAddress The door address.
     * @param destinationChain The destination chain.
     * @param destinationAddress The destination address.
     * @returns The unconfirmed transaction.
     */
    transfer(
        amount: string,
        token: Token,
        doorAddress: string,
        destinationChain: Chain,
        destinationAddress: string,
    ): Promise<Unconfirmed<Transaction>>;
}
