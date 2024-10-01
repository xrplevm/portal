import { IXrplFaucetProvider } from "@frontend/blockchain/providers/xrp/xrpl/xrpl-faucet/interfaces";
import { XrpWalletProvider } from "../../xrp-wallet-provider";
import { XrplFaucetWalletProviderErrors } from "./xrpl-faucet-wallet-provider.errors";
import { IXrplFaucetSeedsRepository } from "./interfaces/i-xrpl-faucet-seeds.repository";
import { XrplSigner } from "@frontend/blockchain/signers/xrp/xrpl";
import { XrplFaucetProvider } from "@frontend/blockchain/providers/xrp/xrpl/xrpl-faucet";
import { Client, Wallet } from "xrpl";
import { ChainType } from "@shared/modules/chain";
import { IXrplSigner } from "@frontend/blockchain/signers/xrp/xrpl/interfaces";

export class XrplFaucetWalletProvider extends XrpWalletProvider<IXrplFaucetProvider, IXrplSigner, XrplFaucetWalletProviderErrors, void> {
    constructor(private readonly xrplFaucetSeedsRepository: IXrplFaucetSeedsRepository) {
        super("xrplFaucet", ChainType.XRP);
    }

    /**
     * @inheritdoc
     */
    protected getProvider(): Promise<IXrplFaucetProvider> {
        return Promise.resolve(new XrplFaucetProvider(new Client(this.chain.urls.ws!), this.chain.urls.faucet!));
    }

    /**
     * @inheritdoc
     */
    protected async getSigner(): Promise<IXrplSigner> {
        const wallet = await this.provider.generateFundedWallet();
        await this.xrplFaucetSeedsRepository.setSeed(wallet.address, wallet.seed!);
        return new XrplSigner(wallet, this.provider);
    }

    /**
     * @inheritdoc
     */
    protected async recoverSigner(address: string): Promise<IXrplSigner | undefined> {
        try {
            const seed = await this.xrplFaucetSeedsRepository.getSeed(address);
            return new XrplSigner(Wallet.fromSeed(seed), this.provider);
        } catch (_e) {
            return undefined;
        }
    }

    /**
     * Removes the signer from the repository.
     * @param address The address of the signer to remove.
     * @returns A promise that resolves when the signer is removed.
     */
    protected removeSigner(address: string): Promise<void> {
        return this.xrplFaucetSeedsRepository.removeSeed(address);
    }

    /**
     * @inheritdoc
     */
    protected afterConnect(): void {
        const removeOnDisconnect = this.on("disconnect", () => {
            this.removeSigner(this.address);
            removeOnDisconnect();
        });
    }
}
