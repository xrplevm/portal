import { BridgeToken } from "@frontend/bridge";
import { AxelarInterchainTokenChainObject, AxelarInterchainTokenObject } from "../types/axelar-interchain-token.types";
import { Chain } from "@frontend/chain";
import { getAxelarResourceUrl } from "../utils/get-axelar-resource-url";
import { TokenObject } from "@frontend/token";

export class AxelarInterchainToken {
    id: string;
    symbol: string;
    name: string;
    decimals: number;
    image: string;
    coingecko_id: string;
    addresses: string[];
    native_chain: string;
    chains: Record<string, AxelarInterchainTokenChainObject>;

    constructor(axelarInterchainToken: AxelarInterchainTokenObject, axelarUrl: string) {
        this.id = axelarInterchainToken.id;
        this.symbol = axelarInterchainToken.symbol;
        this.name = axelarInterchainToken.name;
        this.decimals = axelarInterchainToken.decimals;
        this.image = getAxelarResourceUrl(axelarInterchainToken.image, axelarUrl);
        this.coingecko_id = axelarInterchainToken.coingecko_id;
        this.addresses = axelarInterchainToken.addresses;
        this.native_chain = axelarInterchainToken.native_chain;
        this.chains = axelarInterchainToken.chains;
    }

    /**
     * Converts the AxelarInterchainToken to a BridgeToken.
     * @param chain The chain where the token is from.
     * @returns The BridgeToken.
     */
    toBridgeToken(chain: Chain): BridgeToken {
        return new BridgeToken({
            id: this.id,
            address: this.chains[chain.id].tokenAddress,
            symbol: this.symbol,
            name: this.name,
            decimals: this.decimals,
            image: this.image,
            chains: Object.entries(this.chains).reduce(
                (acc, [chainId, { tokenAddress, symbol, name, decimals }]) => {
                    acc[chainId] = { symbol, name, address: tokenAddress, decimals };
                    return acc;
                },
                {} as Record<string, Pick<TokenObject, "symbol" | "name" | "address" | "decimals">>,
            ),
            nativeChain: chain,
        });
    }
}
