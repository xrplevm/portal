import { mockify } from "@shared/test";
import { Transfer } from "../../../src/common/transfer";
import { ChainMock } from "@frontend/chain/mocks/common";

export const TransferMock = mockify<Transfer>({
    hash: "0x123",
    from: "0x123",
    to: "0x456",
    amount: "100",
    symbol: "ETH",
    decimals: 18,
    createdAt: 1234567890,
    sourceChain: new ChainMock(),
    destinationChain: new ChainMock(),
});
