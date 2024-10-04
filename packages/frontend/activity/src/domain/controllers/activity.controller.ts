import { Controller } from "@frontend/core/domain/controller";
import { IActivityController } from "../../ui/interfaces";
import { IActivityService } from "../interfaces";
import { PaginatedTransfers } from "../../common";

@Controller()
export class ActivityController implements IActivityController {
    constructor(private readonly activityService: IActivityService) {}

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
        return await this.activityService.getPaginatedTransfers(page, pageSize, sourceChain, destinationChain, sender);
    }
}
