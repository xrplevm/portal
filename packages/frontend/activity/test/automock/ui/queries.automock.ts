import { QueryResultMock } from "@frontend/query/mocks";

jest.mock("@frontend/activity/ui/queries", () => ({
    // TODO: https://www.notion.so/Axelar-Add-activity-page-10e21cedf84a80f3b9d3df03ee35545f?pvs=4
    useGetPaginatedTransfers: jest.fn().mockReturnValue(new QueryResultMock({ data: { pages: [{ items: [] }], pageParams: [] } })),
    useGetTransfers: jest.fn().mockReturnValue(new QueryResultMock({ data: [] })),
}));
