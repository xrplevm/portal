import { mockify } from "@shared/test";
import { AxelarGMPTransfersObject } from "../../../src";
import { AxelarGMPTransferObjectMock } from "./axelar-gmp-transfer-object.mock";

export const AxelarGMPTransfersObjectMock = mockify<AxelarGMPTransfersObject>({
    data: [new AxelarGMPTransferObjectMock(), new AxelarGMPTransferObjectMock()],
    total: 0,
    time_spent: 0,
    from: 0,
    pageSize: 0,
});
