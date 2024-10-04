import { PaginatedTransfers } from "../../common";

export interface IActivityService {
    getPaginatedTransfers(
        page: number,
        pageSize: number,
        sourceChain?: string,
        destinationChain?: string,
        sender?: string,
    ): Promise<PaginatedTransfers>;
}
