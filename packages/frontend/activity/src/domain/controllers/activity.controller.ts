import { Controller } from "@frontend/core/domain/controller";
import { IActivityController } from "../../ui/interfaces";
import { IActivityService } from "../interfaces";

@Controller()
export class ActivityController implements IActivityController {
    constructor(private readonly _activityService: IActivityService) {}

    /**
     * Gets the paginated transfers.
     * @returns The paginated transfers.
     */
    // TODO: https://www.notion.so/Axelar-Transfer-tokens-from-XRPL-b5610ee16a82430eba9bbd7789c74642?pvs=4
    async getPaginatedTransfers(): Promise<any> {
        return this._activityService.getPaginatedTransfers();
    }
}
