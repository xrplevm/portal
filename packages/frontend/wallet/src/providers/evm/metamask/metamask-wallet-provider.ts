import { EvmWalletProvider } from "../evm-wallet-provider";
import { IEthersProvider } from "@frontend/blockchain/providers/evm/ethers/interfaces";
import { IWeb3Signer } from "@frontend/blockchain/signers/evm/ethers/web3/interfaces";
import { MetamaskWalletProviderErrors } from "./metamask-wallet-provider.errors";
import { EthersProvider } from "@frontend/blockchain/providers/evm/ethers";
import { ethers, providers } from "ethers";
import { WalletProviderError } from "../../core/error";
import { Web3Signer } from "@frontend/blockchain/signers/evm/ethers/web3";
import { ChainType } from "@shared/modules/chain";

export class MetamaskWalletProvider extends EvmWalletProvider<IEthersProvider, IWeb3Signer, MetamaskWalletProviderErrors, void> {
    constructor() {
        super("metamask", ChainType.EVM);
    }

    protected errorHandlers: Partial<Record<string | "default", MetamaskWalletProviderErrors | (() => void)>> = {
        web3RequestRejected: MetamaskWalletProviderErrors.METAMASK_REQUEST_REJECTED,
        web3PendingRequestsResolutionRequired: MetamaskWalletProviderErrors.METAMASK_PENDING_REQUESTS_RESOLUTION_REQUIRED,
    };

    /**
     * Gets the ethers web3 provider.
     * @returns The ethers web3 provider.
     */
    private getEthersWeb3Provider(): ethers.providers.Web3Provider {
        if ((window as any).ethereum) {
            return new ethers.providers.Web3Provider((window as any).ethereum, "any");
        } else {
            throw new WalletProviderError(MetamaskWalletProviderErrors.METAMASK_NOT_INSTALLED);
        }
    }

    /**
     * @inheritdoc
     */
    protected getProvider(): Promise<IEthersProvider> {
        return Promise.resolve(new EthersProvider(new providers.JsonRpcProvider(this.chain.urls.rpc!)));
    }

    /**
     * @inheritdoc
     */
    protected async getSigner(): Promise<IWeb3Signer> {
        try {
            const ethersWeb3Provider = this.getEthersWeb3Provider();
            await ethersWeb3Provider.send("eth_requestAccounts", []);
            const ethersWeb3Signer = ethersWeb3Provider.getSigner();
            const signer = new Web3Signer(ethersWeb3Signer, this.provider);
            // Try to set the chain to the signer if it is set.
            try {
                await signer.setChainAndConnect(this.chain);
            } catch (_e) {}
            return signer;
        } catch (e) {
            return this.handleError(e, {
                default: MetamaskWalletProviderErrors.METAMASK_REQUEST_REJECTED,
            });
        }
    }

    /**
     * @inheritdoc
     */
    protected async recoverSigner(): Promise<IWeb3Signer | undefined> {
        // Address is not taken into account since it is not needed for the recovery.
        // The first available address will be used.
        try {
            const ethersWeb3Provider = this.getEthersWeb3Provider();
            const ethersWeb3Signer = ethersWeb3Provider.getSigner();
            const signer = new Web3Signer(ethersWeb3Signer, this.provider);
            // Try to set the chain to the signer if it is set.
            try {
                signer.setChain(this.chain);
            } catch (_e) {}
            return signer;
        } catch (_e) {
            return Promise.resolve(undefined);
        }
    }

    /**
     * @inheritdoc
     */
    protected async afterConnect(): Promise<void> {
        const removeOnAccountsChange = this.signer.onAccountsChange((accounts) => {
            if (accounts.length === 0) {
                this.disconnect();
            } else if (this.address?.toLowerCase() !== accounts[0].toLowerCase()) {
                this.connect(accounts[0]);
            }
        });

        const removeOnSetChain = this.on("setChain", async (chain) => {
            if (chain && chain.chainId) {
                this.signer.setChain(chain);
            }
        });
        const removeOnDisconnect = this.on("disconnect", () => {
            removeOnAccountsChange();
            removeOnSetChain();
            removeOnDisconnect();
        });
    }
}
