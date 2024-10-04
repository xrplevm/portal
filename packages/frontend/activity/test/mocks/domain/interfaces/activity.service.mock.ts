import { createMock, MethodMock } from "@shared/test";
import { IActivityService } from "../../../../src/domain/interfaces";
import { TransferMock } from "../../common";

// TODO: https://www.notion.so/Axelar-Add-activity-page-10e21cedf84a80f3b9d3df03ee35545f?pvs=4
export const ActivityServiceMock = createMock<IActivityService>({
    getPaginatedTransfers: new MethodMock("mockResolvedValue", [new TransferMock()]),
});
