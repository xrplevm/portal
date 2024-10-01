import { IWalletProviderProvider } from "@frontend/blockchain/providers/interfaces";
import { IWalletProviderSigner } from "@frontend/blockchain/signers/interfaces";
import { IWalletProvider, WalletProviderEvents } from "./interfaces/i-wallet-provider";
import { WalletProviderEventEmitter } from "./wallet-provider.events";
import { WalletProviderConnectionError, WalletProviderId } from "../types";
import { WalletProviderErrors } from "./wallet-provider.errors";
import { WalletProviderError } from "./error";
import { isProviderError } from "@frontend/blockchain/providers/error";
import { isSignerError } from "@frontend/blockchain/signers/error";
import { Chain } from "@frontend/chain";
import { ChainType } from "@shared/modules/chain";
import { Token } from "@frontend/token";
import { Transaction, Unconfirmed } from "@shared/modules/blockchain";

export abstract class WalletProvider<
    Type extends ChainType = ChainType,
    Provider extends IWalletProviderProvider = IWalletProviderProvider,
    Signer extends IWalletProviderSigner = IWalletProviderSigner,
    Error extends string = string,
    RequestSignerResult = any,
> implements IWalletProvider
{
    /**
     * WalletProvider event emitter
     */
    protected eventEmitter = new WalletProviderEventEmitter();

    /**
     * Wallet provider ID
     */
    providerId: WalletProviderId;
    /**
     * Wallet chain type
     */
    type: Type;

    /**
     * Wallet address
     */
    private _address: string | undefined = undefined;
    get address(): string {
        if (!this._address) throw new Error(WalletProviderErrors.WALLET_NOT_CONNECTED);

        return this._address;
    }
    private set address(address: string | undefined) {
        this._address = address;
    }

    /**
     * Chain the wallet is connected to.
     * This can be changing when an external agent calls the setChain method.
     */
    private _chain: Chain | undefined = undefined;
    protected get chain(): Chain {
        if (!this._chain) throw new Error("Chain is not set");
        return this._chain;
    }
    /**
     * Sets the chain the wallet is connected to.
     * @param chain The chain to set.
     */
    setChain(chain: Chain | undefined): void {
        this._chain = chain;
        this.eventEmitter.emit("setChain", chain);
    }

    private _provider: Provider | undefined;
    protected get provider(): Provider {
        if (!this._provider) {
            throw new Error("Provider not connected");
        }
        return this._provider;
    }
    protected set provider(provider: Provider | undefined) {
        this._provider = provider;
    }

    private _signer: Signer | undefined;
    protected get signer(): Signer {
        if (!this._signer) {
            throw new Error("Signer not connected");
        }
        return this._signer;
    }
    protected set signer(signer: Signer | undefined) {
        this._signer = signer;
    }

    constructor(providerId: WalletProviderId, type: Type) {
        this.providerId = providerId;
        this.type = type;
    }

    /**
     * Error handlers that can be defined to handle generic errors.
     */
    protected errorHandlers: Partial<Record<string, Error | (() => void)>> = {};

    /**
     * Handles an error.
     * @param e The error to handler.
     * @param handlers The error handlers.
     */
    protected handleError(e: any, handlers: Partial<Record<string | "default", Error | (() => void)>> = {}): any {
        handlers = { ...this.errorHandlers, ...handlers };

        if ((isProviderError(e) || isSignerError(e)) && handlers?.[e.message]) {
            const handler = handlers[e.message];
            if (typeof handler === "function") {
                const val = handler();
                if (val !== undefined) throw val;
            } else throw new WalletProviderError(handler!);
        } else if (handlers?.["default"]) {
            const handler = handlers["default"];
            if (typeof handler === "function") {
                const val = handler();
                if (val !== undefined) throw val;
            } else throw new WalletProviderError(handler!);
        } else throw e;
    }

    /**
     * Gets the provider.
     */
    protected abstract getProvider(): Promise<Provider>;

    /**
     * Requests the signer.
     * This method can be implemented if the signer has to be requested.
     * For example, XUMM requires a sign in request.
     * @returns The signer result.
     */
    protected requestSigner(): Promise<RequestSignerResult> {
        return Promise.resolve(null as RequestSignerResult);
    }

    /**
     * Gets the signer.
     */
    protected abstract getSigner(data: RequestSignerResult): Promise<Signer>;

    /**
     * Recovers a signer.
     * @param address The of the signer to recover.
     */
    protected abstract recoverSigner(address: string): Promise<Signer | undefined>;

    /**
     * Runs just before connecting the wallet.
     * Can be overridden to execute logic before connecting.
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected beforeConnect(): Promise<void> | void {}

    /**
     * Runs just after connecting the wallet.
     * Can be overridden to execute logic after connecting.
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected afterConnect(): Promise<void> | void {}

    /**
     * Custom connection error handler.
     * @param _e The error.
     * @returns The error and message or undefined.
     */
    protected onConnectionError(_e: any): [error: WalletProviderConnectionError, message?: string] | undefined {
        return [WalletProviderConnectionError.FAILED];
    }

    /**
     * Handles connection error and emits the `connectionError` event.
     * @param e Any error.
     */
    protected handleConnectionError(e: any): void {
        const errorRes = this.onConnectionError(e) || [WalletProviderConnectionError.FAILED];
        const error = errorRes[0];
        let message = errorRes[1];

        if (!message) {
            message =
                error === WalletProviderConnectionError.REJECTED
                    ? WalletProviderErrors.WALLET_CONNECTION_REJECTED
                    : WalletProviderErrors.WALLET_CONNECTION_FAILED;
        }

        this.eventEmitter.emit("connectionError", error, message);
    }

    /**
     * Completes the connection.
     * Can execute code before and after connecting and gets the signer if it's not set.
     */
    private async completeConnection(): Promise<void> {
        await Promise.resolve(this.beforeConnect());

        this.connect(await this.signer.getAddress());

        await Promise.resolve(this.afterConnect());
    }

    /**
     * Completes the request connection.
     * @param data The data returned by the request connection method.
     */
    private async completeRequestConnection(data: RequestSignerResult): Promise<void> {
        try {
            // Equals to Xumm's verify sign in or Metamask's get signer
            this.signer = await this.getSigner(data);

            await this.completeConnection();
        } catch (e) {
            this.handleConnectionError(e);
        }
    }

    /**
     * Completes the recover connection.
     */
    private async completeRecoverConnection(): Promise<void> {
        await this.completeConnection();
    }

    /**
     * Requests a connection to the wallet.
     * @returns The request signer result.
     */
    async requestConnection(): Promise<RequestSignerResult> {
        try {
            this.provider = await this.getProvider();

            // Equals to Xumm's sign in request
            const res = await Promise.resolve(this.requestSigner());

            this.completeRequestConnection(res);

            return res;
        } catch (e) {
            this.disconnect();
            throw e;
        }
    }

    /**
     * Recovers the connection to the wallet.
     * @param address The address to recover.
     */
    async recoverConnection(address: string): Promise<void> {
        try {
            this.provider = await this.getProvider();
            this.signer = await this.recoverSigner(address);

            if (this.signer) await this.completeRecoverConnection();
            else this.disconnect();
        } catch (_e) {
            this.disconnect();
        }
    }

    /**
     * Connect the wallet and emits the `connect` event.
     * @param address Connected address.
     */
    connect(address: string): void {
        this.address = address;

        this.eventEmitter.emit("connect", address);
    }

    /**
     * Disconnects the wallet and emits the `disconnect` event.
     */
    disconnect(): void {
        this.eventEmitter.emit("disconnect");

        this.provider = undefined;
        this.signer = undefined;
        this.address = undefined;
    }

    /**
     * @inheritdoc
     */
    getAddress(): Promise<string> {
        return Promise.resolve(this.address);
    }

    /**
     * Checks if the wallet account is active.
     * @returns If the wallet account is active.
     */
    async isActive(): Promise<boolean> {
        return this.provider.isAccountActive(this.address);
    }

    /**
     * Gets the native balance of the wallet as a string integer.
     * @returns The native balance of the wallet.
     */
    async getBalance(): Promise<string> {
        return this.provider.getNativeBalance(this.address);
    }

    /**
     * @inheritdoc
     */
    async transfer(amount: string, token: Token, destinationChain: Chain, destinationAddress: string): Promise<Unconfirmed<Transaction>> {
        try {
            return await this.signer.transfer(amount, token, this.chain.door, destinationChain, destinationAddress);
        } catch (e) {
            return this.handleError(e);
        }
    }

    /**
     * @inheritdoc
     */
    on<Event extends keyof WalletProviderEvents>(event: Event, listener: WalletProviderEvents[Event]): () => void {
        return this.eventEmitter.on(event, listener);
    }
}
