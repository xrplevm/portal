import { ActivityController } from "../../../../src/domain/controllers/activity.controller";
import { ActivityServiceMock } from "../../../mocks/domain/interfaces/activity.service.mock";

// TODO: https://www.notion.so/Axelar-Add-activity-page-10e21cedf84a80f3b9d3df03ee35545f?pvs=4
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
