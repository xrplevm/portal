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
    // TODO: https://www.notion.so/Axelar-Add-activity-page-10e21cedf84a80f3b9d3df03ee35545f?pvs=4
    async getPaginatedTransfers(): Promise<any> {
        return this._activityService.getPaginatedTransfers();
    }
}
