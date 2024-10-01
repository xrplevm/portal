import { mockify } from "@shared/test";
import { ContractReceipt } from "ethers";

export const ContractReceiptMock = mockify<ContractReceipt>({
    events: [],
});
