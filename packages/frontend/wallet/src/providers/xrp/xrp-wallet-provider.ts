import { XrpWalletProviderErrors } from "./xrp-wallet-provider.errors";
import { IXrpWalletProviderProvider } from "@frontend/blockchain/providers/xrp/interfaces";
import { IXrpWalletProviderSigner } from "@frontend/blockchain/signers/xrp/interfaces";
import { WalletProvider } from "../core";
import { WalletProviderError } from "../core/error";
import { ITrustReceiptWalletProvider } from "../core/interfaces";
import { Token } from "@frontend/token";
import { ChainType } from "@shared/modules/chain";
import { Transaction, Unconfirmed } from "@shared/modules/blockchain";

export abstract class XrpWalletProvider<
        Provider extends IXrpWalletProviderProvider = IXrpWalletProviderProvider,
        Signer extends IXrpWalletProviderSigner = IXrpWalletProviderSigner,
        Error extends string = string,
        RequestSignerResult = any,
    >
    extends WalletProvider<typeof ChainType.XRP, Provider, Signer, Error, RequestSignerResult>
    implements ITrustReceiptWalletProvider
{
    /**
     * @inheritdoc
     */
    isTrustReceiptRequired(token: Token): boolean {
        return !token.isNative();
    }

    /**
     * @inheritdoc
     */
    trustReceipt(token: Token): Promise<Unconfirmed<Transaction>> {
        if (token.isNative()) throw new WalletProviderError(XrpWalletProviderErrors.CANNOT_TRUST_RECEIPT_WITH_NATIVE_CURRENCY);

        return this.signer.setTrustLine(token.address!, token.symbol);
    }

    /**
     * @inheritdoc
     */
    async isReceiptTrusted(token: Token): Promise<boolean> {
        if (token.isNative()) throw new WalletProviderError(XrpWalletProviderErrors.CANNOT_CHECK_RECEIPT_TRUST_WITH_NATIVE_CURRENCY);

        return this.provider.accountHasTrustLine(this.address, token.address!, token.symbol);
    }
}
