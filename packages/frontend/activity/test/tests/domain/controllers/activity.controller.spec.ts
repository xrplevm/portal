import { ActivityController } from "../../../../src/domain/controllers/activity.controller";
import { ActivityServiceMock } from "../../../mocks/domain/interfaces/activity.service.mock";

// TODO: https://www.notion.so/Axelar-Transfer-tokens-from-XRPL-b5610ee16a82430eba9bbd7789c74642?pvs=4
describe("ActivityController", () => {
    let activityController: ActivityController;

    const activityServiceMock = new ActivityServiceMock();

    beforeEach(async () => {
        activityServiceMock.clearMocks();

        activityController = new ActivityController(activityServiceMock);
    });

    describe("getPaginatedTransfers", () => {
        it("should return the paginated transfers", async () => {
            const transfers = await activityController.getPaginatedTransfers();

            expect(transfers).toEqual(activityServiceMock.getPaginatedTransfers());
        });
    });
});
