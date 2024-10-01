import { QueryResultMock } from "@frontend/query/mocks";

jest.mock("@frontend/chain/ui/queries", () => ({
    // TODO: https://www.notion.so/Axelar-Transfer-tokens-from-XRPL-b5610ee16a82430eba9bbd7789c74642?pvs=4
    useGetPaginatedTransfers: jest.fn().mockReturnValue(new QueryResultMock({ data: [] })),
}));
