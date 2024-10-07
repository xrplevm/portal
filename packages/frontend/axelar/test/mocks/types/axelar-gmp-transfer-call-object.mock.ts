import { mockify } from "@shared/test";
import { AxelarGMPTransferCallObject } from "../../../src";
import { AxelarGMPReturnValuesObjectMock } from "./axelar-gmp-return-values-object.mock";

export const AxelarGMPTransferCallObjectMock = mockify<AxelarGMPTransferCallObject>({
    block_timestamp: 1678901234,
    chain: "ethereum",
    chain_type: "evm",
    event: "TokenSent",
    event_index: 42,
    id: "0x1234567890abcdef",
    // receipt: AxelarGMPTransferReceipt;
    returnValues: new AxelarGMPReturnValuesObjectMock(),
    // transaction: AxelarGMPTransferTransaction;
    transactionHash: "0x0123456789abcdef",
    _id: "transfer123",
    _logIndex: 5,
});
