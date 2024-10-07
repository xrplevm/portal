import { createMock, MethodMock } from "@shared/test";
import { IActivityService } from "../../../../src/domain/interfaces";
import { PaginatedTransfersMock } from "../../common/paginated-transfers.mock";

export const ActivityServiceMock = createMock<IActivityService>({
    getPaginatedTransfers: new MethodMock("mockResolvedValue", new PaginatedTransfersMock()),
});
