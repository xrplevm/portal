import { Transfer, TransferObject } from "./transfer";

export type PaginatedTransfersObject = {
    items: TransferObject[];
    total: number;
    page: number;
    pageSize: number;
};

export class PaginatedTransfers {
    items: Transfer[];
    total: number;
    pages: number;
    currentPage: number;
    pageSize: number;

    constructor(paginatedTransfersObject: PaginatedTransfersObject) {
        this.items = paginatedTransfersObject.items.map((item) => new Transfer(item));
        this.total = paginatedTransfersObject.total;
        this.pages = Math.ceil(paginatedTransfersObject.total / paginatedTransfersObject.pageSize) + 1;
        this.currentPage = paginatedTransfersObject.page;
        this.pageSize = paginatedTransfersObject.pageSize;
    }
}
