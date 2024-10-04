import { ActivityController } from "../../../../src/domain/controllers/activity.controller";
import { PaginatedTransfersMock } from "../../../mocks/common";
import { ActivityServiceMock } from "../../../mocks/domain/interfaces/activity.service.mock";

describe("ActivityController", () => {
    let activityController: ActivityController;

    const page = 1;
    const pageSize = 10;
    const sourceChainAddress = "0x123";
    const destinationChainAddress = "0x456";
    const senderAddress = "0x789";

    const activityServiceMock = new ActivityServiceMock();

    beforeEach(async () => {
        activityServiceMock.clearMocks();

        activityController = new ActivityController(activityServiceMock);
    });

    describe("getPaginatedTransfers", () => {
        it("should return the paginated transfers", async () => {
            const paginatedTransfersMock = new PaginatedTransfersMock();
            activityServiceMock.getPaginatedTransfers.mockResolvedValueOnce(paginatedTransfersMock);

            const paginatedTransfersResult = await activityController.getPaginatedTransfers(
                page,
                pageSize,
                sourceChainAddress,
                destinationChainAddress,
                senderAddress,
            );

            expect(paginatedTransfersResult).toEqual(paginatedTransfersMock);
            expect(activityServiceMock.getPaginatedTransfers).toHaveBeenCalledWith(
                page,
                pageSize,
                sourceChainAddress,
                destinationChainAddress,
                senderAddress,
            );
        });
    });
});
