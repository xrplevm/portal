import { IBridgeTransferController } from "../../../ui/interfaces/i-bridge-transfer.controller";
import { IBridgeChainsController } from "../../../ui/interfaces/i-bridge-chains.controller";
import { IBridgeWalletsController } from "../../../ui/interfaces/i-bridge-wallets.controller";
import { ITrustReceiptWalletProvider, ITrustTransferWalletProvider, IWalletProvider } from "@frontend/wallet/providers/interfaces";
import { Controller } from "@frontend/core/domain/controller";
import { BridgeTransferEventEmitter } from "../../events/bridge-transfer.events";
import {
    BridgeTransferResult,
    BridgeTransferStage,
    BridgeTransferStartData,
    BridgeTransferStatus,
} from "../../../common/types/bridge-transfer.types";
import { BridgeToken } from "../../../common";
import { Confirmed, Transaction } from "@shared/modules/blockchain";
import { Chain } from "@frontend/chain";
import { IBridgeTokenController } from "../../../ui/interfaces";
import { isTrustReceiptWalletProvider, isTrustTransferWalletProvider } from "@frontend/wallet/providers";
import { TranslatorFactory } from "@frontend/blockchain/translators";

@Controller()
export class BridgeTransferController implements IBridgeTransferController {
    constructor(
        private readonly bridgeTokenController: IBridgeTokenController,
        private readonly bridgeChainsController: IBridgeChainsController,
        private readonly bridgeWalletsController: IBridgeWalletsController,
    ) {}

    /**
     * The event emitter of the bridge transfer.
     */
    private readonly eventEmitter = new BridgeTransferEventEmitter();

    /**
     * Swaps the bridge.
     */
    swap(): void {
        this.bridgeChainsController.swap();
        this.bridgeWalletsController.swap();
    }

    /**
     * Handles transfer errors and emits the corresponding events.
     * @param error The error to handle.
     * @param stage The stage where the error occurred.
     * @returns The error.
     */
    private handleTransferError(error: any, stage?: Exclude<BridgeTransferStage, BridgeTransferStage.IDLE>): any {
        if (stage) this.eventEmitter.emit(`${stage}Failed`, error);
        this.eventEmitter.emit("failed", error);

        return error;
    }

    /**
     * Prepares the transfer.
     * @param amount The amount to transfer.
     * @param token The token to transfer.
     * @param originChain The origin chain.
     * @param destinationChain The destination chain.
     * @param originWallet The origin wallet.
     * @param destinationWallet The destination wallet.
     * @returns The transfer start data.
     */
    async prepareTransfer(
        amount: string,
        token: BridgeToken,
        originChain: Chain,
        destinationChain: Chain,
        originWallet: IWalletProvider,
        destinationWallet: IWalletProvider,
    ): Promise<BridgeTransferStartData> {
        const isTrustReceiptRequired = isTrustReceiptWalletProvider(destinationWallet)
            ? destinationWallet.isTrustReceiptRequired(token.toChainToken(destinationChain.id))
            : false;
        const isTrustTransferRequired = isTrustTransferWalletProvider(originWallet)
            ? originWallet.isTrustTransferRequired(token.toChainToken(originChain.id))
            : false;

        const bridgeTransferStartData: BridgeTransferStartData = {
            isTrustReceiptRequired,
            isTrustTransferRequired,
            amount,
            token,
        };

        this.eventEmitter.emit("start", bridgeTransferStartData);

        return bridgeTransferStartData;
    }

    /**
     * Trusts the receipt of the tokens.
     * @param amount The amount to transfer.
     * @param token The token to transfer.
     * @param destinationChain The destination chain.
     * @param destinationWallet The destination wallet.
     * @returns The trust receipt result.
     */
    async trustReceipt(
        amount: string,
        token: BridgeToken,
        destinationChain: Chain,
        destinationWallet: ITrustReceiptWalletProvider,
    ): Promise<Confirmed<Transaction> | undefined> {
        let trustReceiptResult: Confirmed<Transaction> | undefined = undefined;

        const destinationChainToken = token.toChainToken(destinationChain.id);

        try {
            const isClaimTrusted = await destinationWallet.isReceiptTrusted(destinationChainToken);

            if (isClaimTrusted) {
                this.eventEmitter.emit("trustReceiptConfirmed");
            } else {
                this.eventEmitter.emit("stage", BridgeTransferStage.TRUST_RECEIPT);
                this.eventEmitter.emit("trustReceiptRequested");
                const unconfirmedTrustReceipt = await destinationWallet.trustReceipt(destinationChainToken, amount);
                this.eventEmitter.emit("trustReceiptSigned", unconfirmedTrustReceipt);
                trustReceiptResult = await unconfirmedTrustReceipt.wait();
                this.eventEmitter.emit("trustReceiptConfirmed", trustReceiptResult);
            }

            return trustReceiptResult;
        } catch (error) {
            throw this.handleTransferError(error, BridgeTransferStage.TRUST_RECEIPT);
        }
    }

    /**
     * Trusts the transfer of the tokens.
     * @param amount The amount to transfer.
     * @param token The token to transfer.
     * @param originChain The origin chain.
     * @param originWallet The origin wallet.
     * @returns The trust transfer result.
     */
    async trustTransfer(
        amount: string,
        token: BridgeToken,
        originChain: Chain,
        originWallet: ITrustTransferWalletProvider,
    ): Promise<Confirmed<Transaction> | undefined> {
        let trustTransferResult: Confirmed<Transaction> | undefined = undefined;

        const originChainToken = token.toChainToken(originChain.id);

        try {
            const isCommitTrusted = await originWallet.isTransferTrusted(originChainToken);

            if (isCommitTrusted) {
                this.eventEmitter.emit("trustTransferConfirmed");
            } else {
                this.eventEmitter.emit("stage", BridgeTransferStage.TRUST_TRANSFER);
                this.eventEmitter.emit("trustTransferRequested");
                const unconfirmedTrustTransfer = await originWallet.trustTransfer(originChainToken, amount);
                this.eventEmitter.emit("trustTransferSigned", unconfirmedTrustTransfer);
                trustTransferResult = await unconfirmedTrustTransfer.wait();
                this.eventEmitter.emit("trustTransferConfirmed", trustTransferResult);
            }

            return trustTransferResult;
        } catch (error) {
            throw this.handleTransferError(error, BridgeTransferStage.TRUST_TRANSFER);
        }
    }

    /**
     * Transfers the tokens.
     * @param amount The amount to transfer.
     * @param token The token to transfer.
     * @param originChain The origin chain.
     * @param destinationChain The destination chain.
     * @param originWallet The origin wallet.
     * @param destinationWallet The destination wallet.
     * @returns The transfer result.
     */
    async transfer(
        amount: string,
        token: BridgeToken,
        originChain: Chain,
        destinationChain: Chain,
        originWallet: IWalletProvider,
        destinationWallet: IWalletProvider,
    ): Promise<Confirmed<Transaction>> {
        const originChainToken = token.toChainToken(originChain.id);
        const destinationAddress = TranslatorFactory(originChain).translate(destinationChain.type, destinationWallet.address);

        try {
            this.eventEmitter.emit("stage", BridgeTransferStage.TRANSFER);
            this.eventEmitter.emit("transferRequested");
            const unconfirmedCommit = await originWallet.transfer(amount, originChainToken, destinationChain, destinationAddress);
            this.eventEmitter.emit("transferSigned", unconfirmedCommit);
            const confirmedCommit = await unconfirmedCommit.wait();
            this.eventEmitter.emit("transferConfirmed", confirmedCommit);
            return confirmedCommit;
        } catch (error) {
            throw this.handleTransferError(error, BridgeTransferStage.TRANSFER);
        }
    }

    /**
     * Awaits the transfer until it is confirmed and received by the destination wallet.
     */
    async awaitReceipt(): Promise<void> {
        // TODO: Implement
        try {
            this.eventEmitter.emit("stage", BridgeTransferStage.AWAIT_RECEIPT);
            this.eventEmitter.emit("awaitReceiptStarted");
            this.eventEmitter.emit("status", BridgeTransferStatus.SENT);

            await new Promise((resolve) => setTimeout(resolve, 50000));

            this.eventEmitter.emit("status", BridgeTransferStatus.CONFIRMED);

            await new Promise((resolve) => setTimeout(resolve, 50000));

            this.eventEmitter.emit("status", BridgeTransferStatus.RECEIVED);
            this.eventEmitter.emit("awaitReceiptCompleted");
        } catch (e) {
            throw this.handleTransferError(e, BridgeTransferStage.AWAIT_RECEIPT);
        }
    }

    /**
     * Executes the full transfer.
     * @param amount The amount to transfer.
     * @returns The transfer result.
     */
    async executeTransfer(amount: string): Promise<BridgeTransferResult> {
        const token = this.bridgeTokenController.getBridgeToken();
        const originChain = this.bridgeChainsController.getOriginChain();
        const destinationChain = this.bridgeChainsController.getDestinationChain();
        const originWalletProvider = this.bridgeWalletsController.getOriginWalletProvider();
        const destinationWalletProvider = this.bridgeWalletsController.getDestinationWalletProvider();

        const transferStartData = await this.prepareTransfer(
            amount,
            token,
            originChain,
            destinationChain,
            originWalletProvider,
            destinationWalletProvider,
        );

        let trustReceiptResult: Confirmed<Transaction> | undefined = undefined;
        let trustTransferResult: Confirmed<Transaction> | undefined = undefined;

        if (transferStartData.isTrustReceiptRequired) {
            trustReceiptResult = await this.trustReceipt(
                amount,
                token,
                destinationChain,
                // `isTrustReceiptRequired` ensures that the destination wallet provider is a `ITrustReceiptWalletProvider`.
                destinationWalletProvider as ITrustReceiptWalletProvider,
            );
        }

        if (transferStartData.isTrustTransferRequired) {
            trustTransferResult = await this.trustTransfer(
                amount,
                token,
                originChain,
                // `isTrustTransferRequired` ensures that the origin wallet provider is a `ITrustTransferWalletProvider`.
                originWalletProvider as ITrustTransferWalletProvider,
            );
        }

        const transfer = await this.transfer(amount, token, originChain, destinationChain, originWalletProvider, destinationWalletProvider);

        await this.awaitReceipt();

        const result: BridgeTransferResult = {
            amount,
            token,
            originChain,
            destinationChain,
            originAddress: originWalletProvider.address,
            destinationAddress: destinationWalletProvider.address,
            trustReceipt: trustReceiptResult,
            trustTransfer: trustTransferResult,
            transfer,
        };

        this.eventEmitter.emit("completed", result);

        return result;
    }

    /**
     * Sets a listener for the given event.
     * @param event The event to listen to.
     * @param listener The listener to set.
     * @returns The listener.
     */
    on = this.eventEmitter.on.bind(this.eventEmitter);
}
