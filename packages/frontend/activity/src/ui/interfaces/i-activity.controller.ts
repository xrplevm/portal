import { PaginatedTransfers } from "../../common";

export interface IActivityController {
    getPaginatedTransfers(
        page: number,
        pageSize: number,
        sourceChain?: string,
        destinationChain?: string,
        sender?: string,
    ): Promise<PaginatedTransfers>;
}
