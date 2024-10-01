import { Chain } from "@frontend/chain";
import { BridgeToken } from "../../common/bridge-token";

export interface IBridgeTokenController {
    getBridgeTokens(chain: Chain, otherChain: Chain, query?: string): Promise<BridgeToken[]>;
    setBridgeToken(token: BridgeToken | undefined): void;
    getBridgeToken(): BridgeToken;
}
