import { createMock, MethodMock } from "@shared/test";
import { IActivityService } from "../../../../src/domain/interfaces";
import { TransferMock } from "../../common";

// TODO: https://www.notion.so/Axelar-Transfer-tokens-from-XRPL-b5610ee16a82430eba9bbd7789c74642?pvs=4
export const ActivityServiceMock = createMock<IActivityService>({
    getPaginatedTransfers: new MethodMock("mockResolvedValue", [new TransferMock()]),
});
