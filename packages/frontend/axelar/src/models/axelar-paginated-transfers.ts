import { PaginatedTransfers } from "@frontend/activity";
import { AxelarGMPTransferObject, AxelarGMPTransfersObject } from "../types";
import { AxelarTransfer } from "./axelar-transfer";

export class PaginatedAxelarTransfers {
    items: AxelarTransfer[];
    total: number;
    page: number;
    pageSize: number;

    constructor(paginatedAxelarTransfers: AxelarGMPTransfersObject, page: number, pageSize: number, axelarUrl: string) {
        this.items = paginatedAxelarTransfers.data.map((transfer: AxelarGMPTransferObject) => new AxelarTransfer(transfer, axelarUrl));
        this.total = paginatedAxelarTransfers.total;
        this.page = page;
        this.pageSize = pageSize;
    }

    /**
     * Converts the paginated Axelar transfers to a paginated transfers object.
     * @returns The paginated transfers object.
     */
    toPaginatedTransfers(): PaginatedTransfers {
        const transfers = this.items.map((item) => item.toTransfer());
        return new PaginatedTransfers({
            items: transfers,
            total: this.total,
            page: this.page,
            pageSize: this.pageSize,
        });
    }
}
