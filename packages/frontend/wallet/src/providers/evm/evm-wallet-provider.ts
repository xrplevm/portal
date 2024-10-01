import { IEvmWalletProviderProvider } from "@frontend/blockchain/providers/evm/interfaces";
import { WalletProvider } from "../core/wallet-provider";
import { ITrustTransferWalletProvider } from "../core/interfaces/i-wallet-provider";
import { WalletProviderError } from "../core/error";
import { EvmWalletProviderErrors } from "./evm-wallet-provider.errors";
import { Token } from "@frontend/token";
import { ChainType } from "@shared/modules/chain";
import { Transaction, Unconfirmed } from "@shared/modules/blockchain";
import { IEvmWalletProviderSigner } from "@frontend/blockchain/signers/evm/interfaces";

export abstract class EvmWalletProvider<
        Provider extends IEvmWalletProviderProvider = IEvmWalletProviderProvider,
        Signer extends IEvmWalletProviderSigner = IEvmWalletProviderSigner,
        Error extends string = string,
        RequestSignerResult = any,
    >
    extends WalletProvider<typeof ChainType.EVM, Provider, Signer, Error, RequestSignerResult>
    implements ITrustTransferWalletProvider
{
    /**
     * @inheritdoc
     */
    isTrustTransferRequired(token: Token): boolean {
        return !token.isNative();
    }

    /**
     * @inheritdoc
     */
    async trustTransfer(token: Token): Promise<Unconfirmed<Transaction>> {
        if (token.isNative()) throw new WalletProviderError(EvmWalletProviderErrors.CANNOT_TRUST_TRANSFER_WITH_NATIVE_TOKEN);

        try {
            return await this.signer.approveERC20(token.address!, this.chain.door);
        } catch (e) {
            return this.handleError(e);
        }
    }

    /**
     * @inheritdoc
     */
    async isTransferTrusted(token: Token): Promise<boolean> {
        if (token.isNative()) throw new WalletProviderError(EvmWalletProviderErrors.CANNOT_CHECK_TRANSFER_TRUST_WITH_NATIVE_TOKEN);

        return this.provider.isERC20Approved(token.address!, this.address, this.chain.door);
    }
}
