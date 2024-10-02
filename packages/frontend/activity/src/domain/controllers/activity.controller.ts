import { Controller } from "@frontend/core/domain/controller";
import { IActivityController } from "../../ui/interfaces";
import { IActivityService } from "../interfaces";
import { PaginatedTransfers, Transfer } from "../../common";
import { State } from "@frontend/core/domain/state";
import { IBridgeChainsState } from "@frontend/bridge/domain/states";

@Controller()
export class ActivityController implements IActivityController {
    constructor(
        private readonly activityService: IActivityService,
        private readonly bridgeChainsState: State<IBridgeChainsState>,
    ) {}

    /**
     * Gets the paginated transfers.
     * @param page The page number.
     * @param pageSize The page size.
     * @param sourceChain The source chain.
     * @param destinationChain The destination chain.
     * @param sender The sender.
     * @returns The paginated transfers.
     */
    async getPaginatedTransfers(
        page: number,
        pageSize: number,
        sourceChain?: string,
        destinationChain?: string,
        sender?: string,
    ): Promise<PaginatedTransfers> {
        const state = this.bridgeChainsState.getState();
        const paginatedTransfers = await this.activityService.getPaginatedTransfers(page, pageSize, sourceChain, destinationChain, sender);

        return {
            items: paginatedTransfers.items.reduce((acc, transfer) => {
                if (transfer.destinationChainId == state.destinationChain?.id) {
                    transfer.destinationChain = state.destinationChain;
                    transfer.sourceChain = state.originChain;
                } else {
                    transfer.destinationChain = state.originChain;
                    transfer.sourceChain = state.destinationChain;
                }
                acc.push(transfer);
                return acc;
            }, [] as Transfer[]),
            total: paginatedTransfers.total,
            pages: paginatedTransfers.pages,
            currentPage: paginatedTransfers.currentPage,
            pageSize: paginatedTransfers.pageSize,
        };
    }
}
