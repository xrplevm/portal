import { EventEmitter } from "@frontend/events";
import { Confirmed, Transaction, Unconfirmed } from "@shared/modules/blockchain";
import {
    BridgeTransferResult,
    BridgeTransferStage,
    BridgeTransferStartData,
    BridgeTransferStatus,
} from "../../common/types/bridge-transfer.types";

export type BridgeTransferEvents = {
    trustReceiptRequested: () => void;
    trustReceiptSigned: (unconfirmedTrustClaimTransaction: Unconfirmed<Transaction>) => void;
    trustReceiptConfirmed: (confirmedTrustClaimTransaction?: Confirmed<Transaction>) => void;
    trustReceiptFailed: (error: any) => void;
    trustTransferRequested: () => void;
    trustTransferSigned: (unconfirmedTrustCommitTransaction: Unconfirmed<Transaction>) => void;
    trustTransferConfirmed: (confirmedTrustCommitTransaction?: Confirmed<Transaction>) => void;
    trustTransferFailed: (error: any) => void;
    transferRequested: () => void;
    transferSigned: (unconfirmedCreateClaimTransaction: Unconfirmed<Transaction>) => void;
    transferConfirmed: (confirmedCreateClaimTransaction: Confirmed<Transaction>) => void;
    transferFailed: (error: any) => void;
    awaitReceiptStarted: () => void;
    awaitReceiptCompleted: () => void;
    awaitReceiptFailed: (error: any) => void;
    status: (status: BridgeTransferStatus) => void;
    start: (data: BridgeTransferStartData) => void;
    stage: (stage: BridgeTransferStage) => void;
    completed: (result: BridgeTransferResult) => void;
    failed: (error: any) => void;
};
export interface IBridgeTransferController {
    swap(): void;
    executeTransfer(amount: string): Promise<BridgeTransferResult>;
    on: EventEmitter<BridgeTransferEvents>["on"];
}
