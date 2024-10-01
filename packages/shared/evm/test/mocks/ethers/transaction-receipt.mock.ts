import { mockify } from "@shared/test";
import { providers } from "ethers";

export const TransactionReceiptMock = mockify<providers.TransactionReceipt>({
    transactionHash: "1234",
});
