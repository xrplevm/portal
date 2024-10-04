import { mockify } from "@shared/test";
import { AxelarGMPTransferConfirmObject } from "../../../src";

export const AxelarGMPTransferConfirmObjectMock = mockify<AxelarGMPTransferConfirmObject>({
    blockNumber: 12345678,
    block_timestamp: 1678901234,
    confirmation_txhash: "0xabcdef1234567890abcdef1234567890",
    contract_address: "0x9876543210fedcba9876543210fedcba",
    event: "TransferConfirmed",
    poll_id: "poll_123456",
    sourceChain: "ethereum",
    sourceTransactionHash: "0x0123456789abcdef0123456789abcdef",
    transactionHash: "0xfedcba9876543210fedcba9876543210",
    transactionIndex: 42,
});
