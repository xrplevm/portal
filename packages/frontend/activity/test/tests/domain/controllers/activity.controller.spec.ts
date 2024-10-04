import { ActivityController } from "../../../../src/domain/controllers/activity.controller";
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
            const transfers = await activityController.getPaginatedTransfers(
                page,
                pageSize,
                sourceChainAddress,
                destinationChainAddress,
                senderAddress,
            );

            expect(transfers).toHaveLength(2);
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
