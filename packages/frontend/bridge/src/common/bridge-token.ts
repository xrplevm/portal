import { Chain, ChainObject } from "@frontend/chain";
import { Token, TokenObject } from "@frontend/token";

export type BridgeChainTokenObject = {
    symbol: string;
    name: string;
    address?: string;
    decimals?: number;
};

export type BridgeTokenObject = TokenObject & {
    id: string;
    // The addresses of the token on different chains.
    chains: Record<string, BridgeChainTokenObject>;
    nativeChain: ChainObject;
};

export class BridgeToken extends Token {
    id: string;
    chains: Record<string, BridgeChainTokenObject>;
    nativeChain: Chain;

    constructor(bridgeToken: BridgeTokenObject) {
        super(bridgeToken);
        this.id = bridgeToken.id;
        this.chains = bridgeToken.chains;
        this.nativeChain = new Chain(bridgeToken.nativeChain);
    }

    /**
     * Converts the bridge token to a chain token.
     * @param chain The chain to convert the bridge token to.
     * @returns The chain token.
     */
    toChainToken(chain: string): Token {
        const chainToken = this.chains[chain];

        return new Token({
            id: this.id,
            symbol: chainToken.symbol,
            decimals: chainToken.decimals ?? this.decimals,
            name: chainToken.name,
            image: this.image,
            address: chainToken.address,
        });
    }
}
