import { BridgeSource } from "xchain-sdk";
import { IBridgeWalletsController } from "../../../ui/interfaces/i-bridge-wallets.controller";
import { IBridgeChainsController } from "../../../ui/interfaces/i-bridge-chains.controller";
import { State } from "@frontend/core/domain/state";
import { IBridgeWalletsState } from "../../states/bridge-wallets.state";
import { IBridgeWalletsRepository } from "../../interfaces/i-bridge-wallets.repository";
import { BridgeWallet, BridgeWalletPair } from "../../../common/types/bridge-wallet.types";
import { PersistedWallet } from "@frontend/wallet";
import { WalletProvider, WalletProviderConnectionError, WalletProviderFactory, WalletProviderId } from "@frontend/wallet/providers";
import { Controller } from "@frontend/core/domain/controller";
import { DomainError } from "@frontend/core/domain/error";
import { BridgeWalletsErrors } from "../../errors/bridge-wallets.errors";

@Controller()
export class BridgeWalletsController implements IBridgeWalletsController {
    /**
     * Reference to the origin wallet provider.
     */
    private originWalletProvider: WalletProvider | undefined = undefined;

    /**
     * Reference to the destination wallet provider.
     */
    private destinationWalletProvider: WalletProvider | undefined = undefined;
    constructor(
        private readonly bridgeChainsController: IBridgeChainsController,
        private readonly bridgeWalletsState: State<IBridgeWalletsState>,
        private readonly bridgeWalletsRepository: IBridgeWalletsRepository,
    ) {}

    /**
     * Initialize the controller.
     */
    async onInit(): Promise<void> {
        // Update wallet provider chains when bridge chains change
        this.bridgeChainsController.on("bridgeChainsChange", ({ originChain, destinationChain }) => {
            if (!destinationChain || destinationChain.type !== this.destinationWalletProvider?.type)
                this.destinationWalletProvider?.disconnect();
            else this.destinationWalletProvider?.setChain(destinationChain);

            if (!originChain || originChain.type !== this.originWalletProvider?.type) this.originWalletProvider?.disconnect();
            else this.originWalletProvider?.setChain(originChain);
        });

        // Check for persisted wallets and recover them
        this.bridgeChainsController.on("bridgeChainsLoad", async ({ originChain, destinationChain }) => {
            const persistedWallets = await this.bridgeWalletsRepository.getBridgeWallets();

            let originWalletRecoveryPromise: Promise<void> | undefined = undefined;
            let destinationWalletRecoveryPromise: Promise<void> | undefined = undefined;

            if (persistedWallets?.originWallet) {
                if (!originChain || originChain.type !== persistedWallets.originWallet.type)
                    this.bridgeWalletsRepository.setOriginWallet(undefined);
                else originWalletRecoveryPromise = this.recoverWalletConnection(BridgeSource.ORIGIN, persistedWallets.originWallet);
            }
            if (persistedWallets?.destinationWallet) {
                if (!destinationChain || destinationChain.type !== persistedWallets.destinationWallet.type)
                    this.bridgeWalletsRepository.setDestinationWallet(undefined);
                else
                    destinationWalletRecoveryPromise = this.recoverWalletConnection(
                        BridgeSource.DESTINATION,
                        persistedWallets.destinationWallet,
                    );
            }

            await Promise.all([originWalletRecoveryPromise, destinationWalletRecoveryPromise]);
        });
    }

    /**
     * Get the origin wallet provider.
     * @returns The origin wallet provider.
     */
    getOriginWalletProvider(): WalletProvider {
        if (!this.originWalletProvider) throw new DomainError(BridgeWalletsErrors.ORIGIN_WALLET_PROVIDER_NOT_SET);
        return this.originWalletProvider;
    }

    /**
     * Get the destination wallet provider.
     * @returns The destination wallet provider.
     */
    getDestinationWalletProvider(): WalletProvider {
        if (!this.destinationWalletProvider) throw new DomainError(BridgeWalletsErrors.DESTINATION_WALLET_PROVIDER_NOT_SET);
        return this.destinationWalletProvider;
    }

    /**
     * Update the wallet provider state partially.
     * @param provider The wallet provider to update.
     * @param state The new state to set.
     */
    private updateWalletState(provider: WalletProvider, state: Partial<BridgeWallet>): void {
        const source = this.getWalletProviderSource(provider);
        const walletStateKey = `${source}Wallet` as const;
        this.bridgeWalletsState.setState((prevState) => ({ ...prevState, [walletStateKey]: { ...prevState[walletStateKey], ...state } }));
    }

    /**
     * Override the wallet state for the given wallet provider.
     * @param provider The wallet provider to override.
     * @param state The new state to set.
     */
    private overrideWalletState(provider: WalletProvider, state: BridgeWallet): void {
        const source = this.getWalletProviderSource(provider);
        const walletStateKey = `${source}Wallet` as const;
        this.bridgeWalletsState.setState({ [walletStateKey]: state });
    }

    /**
     * Get the wallet provider source.
     * @param provider The wallet provider.
     * @returns The wallet provider source.
     */
    private getWalletProviderSource(provider: WalletProvider): BridgeSource {
        if (this.originWalletProvider === provider) return BridgeSource.ORIGIN;
        else if (this.destinationWalletProvider === provider) return BridgeSource.DESTINATION;
        else throw new Error("Wallet provider is not set");
    }

    /**
     * Prepares a wallet provider for connection and sets up the corresponding listeners.
     * @param source The wallet source to setup to.
     * @param providerId The wallet provider to use.
     * @returns The wallet provider.
     */
    private async setupWalletProvider(source: BridgeSource, providerId: WalletProviderId): Promise<WalletProvider> {
        const walletProviderKey = `${source}WalletProvider` as const;

        const walletProvider: WalletProvider = WalletProviderFactory[providerId];
        this[walletProviderKey] = walletProvider;

        walletProvider.setChain(
            source === BridgeSource.ORIGIN
                ? this.bridgeChainsController.getOriginChain()
                : this.bridgeChainsController.getDestinationChain(),
        );

        this.overrideWalletState(walletProvider, {
            connection: "connecting",
            providerId,
            type: walletProvider.type,
        });

        const removeOnConnectionError = walletProvider.on("connectionError", (connectionError) => {
            this.updateWalletState(walletProvider, {
                connection: connectionError === WalletProviderConnectionError.REJECTED ? "rejected" : "failed",
            });
        });
        const removeOnConnect = walletProvider.on("connect", (address) => {
            this.updateWalletState(walletProvider, { connection: "connected", address });
            // persist wallet
            this.bridgeWalletsRepository.setWalletSource(this.getWalletProviderSource(walletProvider), {
                address,
                type: walletProvider.type,
                providerId: walletProvider.providerId,
            });
        });
        const removeOnDisconnect = walletProvider.on("disconnect", () => {
            // If no other wallet has requested a connection, remove the waller provider reference and update the state to disconnected

            // TS shows incorrect type error because getter is not defined as undefined but setter is.
            this.overrideWalletState(walletProvider, { connection: "disconnected" });
            const walletProviderSource = this.getWalletProviderSource(walletProvider);
            // Remove persisted wallet
            this.bridgeWalletsRepository.setWalletSource(walletProviderSource, undefined);
            this[`${walletProviderSource}WalletProvider`] = undefined;

            removeOnConnect();
            removeOnConnectionError();
            removeOnDisconnect();
        });

        return walletProvider;
    }

    /**
     * Private utility method used to request a wallet connection. The corresponding wallet source and state will be updated depending on the connection.
     * @param source The wallet source to connect to.
     * @param providerId The wallet provider to use.
     * @returns The wallet provider.
     */
    private async requestWalletConnection<ProviderId extends WalletProviderId>(
        source: BridgeSource,
        providerId: ProviderId,
        // @ts-ignore `Type '"requestConnection"' cannot be used to index type ...` Of course it can -_-
    ): Promise<InferWalletProviderRequestConnectionReturnType<ProviderId>> {
        const walletProvider = await this.setupWalletProvider(source, providerId);

        return walletProvider.requestConnection();
    }

    /**
     * Private utility method used to recover a wallet connection. The corresponding wallet source and state will be updated depending on the connection.
     * @param source The wallet source to recover.
     * @param wallet The persisted wallet provider to recover.
     * @returns The wallet provider.
     */
    private async recoverWalletConnection(source: BridgeSource, wallet: PersistedWallet): Promise<void> {
        const walletProvider = await this.setupWalletProvider(source, wallet.providerId);

        return walletProvider.recoverConnection(wallet.address);
    }

    /**
     * Request a connection to the origin wallet.
     * @param providerId The wallet provider to use.
     * @returns The wallet provider.
     */
    async requestOriginWalletConnection(providerId: WalletProviderId): Promise<WalletProvider> {
        if (this.originWalletProvider) this.originWalletProvider.disconnect();
        return this.requestWalletConnection(BridgeSource.ORIGIN, providerId);
    }

    /**
     * Request a connection to the destination wallet.
     * @param providerId The wallet provider to use.
     * @returns The wallet provider.
     */
    async requestDestinationWalletConnection(providerId: WalletProviderId): Promise<WalletProvider> {
        if (this.destinationWalletProvider) this.destinationWalletProvider.disconnect();
        return this.requestWalletConnection(BridgeSource.DESTINATION, providerId);
    }

    /**
     * Disconnects the origin wallet.
     * @pre The origin wallet must be connected.
     */
    disconnectOriginWallet(): void {
        if (!this.originWalletProvider) throw new Error("Origin wallet is not connected");
        this.originWalletProvider.disconnect();
    }

    /**
     * Disconnects the destination wallet.
     * @pre The destination wallet must be connected.
     */
    disconnectDestinationWallet(): void {
        if (!this.destinationWalletProvider) throw new Error("Destination wallet is not connected");
        this.destinationWalletProvider.disconnect();
    }

    /**
     * Disconnects the wallet on the given source.
     * @param source The wallet source to disconnect.
     * @pre The wallet on the given source must be connected.
     */
    disconnectWallet(source: BridgeSource): void {
        if (source === BridgeSource.ORIGIN) this.disconnectOriginWallet();
        else this.disconnectDestinationWallet();
    }

    /**
     * Swap the origin and destination wallets.
     */
    swap(): void {
        const originWalletProvider = this.originWalletProvider;
        const destinationWalletProvider = this.destinationWalletProvider;
        this.originWalletProvider = destinationWalletProvider;
        this.destinationWalletProvider = originWalletProvider;

        this.bridgeWalletsState.setState((prevState) => {
            // Persist swap
            this.bridgeWalletsRepository.setBridgeWallets({
                originWallet:
                    prevState.destinationWallet.connection === "connected"
                        ? {
                              address: prevState.destinationWallet.address,
                              type: prevState.destinationWallet.type,
                              providerId: prevState.destinationWallet.providerId,
                          }
                        : undefined,
                destinationWallet:
                    prevState.originWallet.connection === "connected"
                        ? {
                              address: prevState.originWallet.address,
                              type: prevState.originWallet.type,
                              providerId: prevState.originWallet.providerId,
                          }
                        : undefined,
            });

            return {
                originWallet: prevState.destinationWallet,
                destinationWallet: prevState.originWallet,
            };
        });
    }

    /**
     * Get the origin wallet.
     * @returns The origin wallet.
     */
    getOriginWallet(): BridgeWallet {
        return this.bridgeWalletsState.getState().originWallet;
    }

    /**
     * Get the destination wallet.
     * @returns The destination wallet.
     */
    getDestinationWallet(): BridgeWallet {
        return this.bridgeWalletsState.getState().destinationWallet;
    }

    /**
     * Get the bridge wallets state.
     * @returns The bridge wallets state.
     */
    getBridgeWallets(): BridgeWalletPair {
        return this.bridgeWalletsState.getState();
    }
}
