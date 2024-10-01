import { mockify } from "@shared/test";
import { BridgeToken } from "../../../src/common/bridge-token";
import { ChainMock } from "@frontend/chain/mocks/common";
import { TokenMock } from "@frontend/token/mocks/common";

export const BridgeTokenMock = mockify<BridgeToken>({
    symbol: "XRP",
    name: "XRP",
    id: "xrp",
    chains: {},
    nativeChain: new ChainMock(),
    toChainToken: jest.fn().mockReturnValue(new TokenMock()),
});
