import { mockify } from "@shared/test";
import { PaginatedTransfers } from "../../../src/common/paginated-transfers";
import { TransferMock } from "./transfer.mock";

export const PaginatedTransfersMock = mockify<PaginatedTransfers>({
    items: [new TransferMock()],
    total: 1,
    pages: 1,
    currentPage: 1,
    pageSize: 1,
});
