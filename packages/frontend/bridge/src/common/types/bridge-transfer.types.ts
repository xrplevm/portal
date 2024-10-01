import { ChainObject } from "@frontend/chain";
import { BridgeTokenObject } from "../bridge-token";
import { Confirmed, Transaction } from "@shared/modules/blockchain";

export type BridgeTransferResult = {
    amount: string;
    token: BridgeTokenObject;
    originChain: ChainObject;
    destinationChain: ChainObject;
    originAddress: string;
    destinationAddress: string;
    trustReceipt?: Confirmed<Transaction>;
    trustTransfer?: Confirmed<Transaction>;
    transfer: Confirmed<Transaction>;
};

export type BridgeTransferStartData = {
    amount: string;
    token: BridgeTokenObject;
    isTrustReceiptRequired: boolean;
    isTrustTransferRequired: boolean;
};

export enum BridgeTransferStatus {
    SENT = "sent",
    CONFIRMED = "confirmed",
    RECEIVED = "received",
}

export enum BridgeTransferStage {
    IDLE = "idle",
    TRUST_RECEIPT = "trustReceipt",
    TRUST_TRANSFER = "trustTransfer",
    TRANSFER = "transfer",
    AWAIT_RECEIPT = "awaitReceipt",
}
