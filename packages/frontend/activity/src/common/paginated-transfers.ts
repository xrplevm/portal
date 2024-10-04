import { Transfer } from "./transfer";

export class PaginatedTransfers {
    items: Transfer[];
    total: number;
    pages: number;
    currentPage: number;
    pageSize: number;

    constructor(transfers: Transfer[], total: number, page: number, pageSize: number) {
        this.items = transfers;
        this.total = total;
        this.pages = Math.ceil(total / pageSize) + 1;
        this.currentPage = page;
        this.pageSize = pageSize;
    }
}
