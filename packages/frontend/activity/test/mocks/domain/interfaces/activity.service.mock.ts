import { createMock, MethodMock } from "@shared/test";
import { IActivityService } from "../../../../src/domain/interfaces";
import { TransferMock } from "../../common";

export const ActivityServiceMock = createMock<IActivityService>({
    getPaginatedTransfers: new MethodMock("mockResolvedValue", [new TransferMock(), new TransferMock()]),
});
