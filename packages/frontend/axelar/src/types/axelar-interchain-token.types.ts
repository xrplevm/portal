export type AxelarInterchainTokenChainObject = {
    tokenAddress: string;
    symbol: string;
    name: string;
    tokenManager: string;
    tokenManagerType: string;
    decimals: number;
};

export type AxelarInterchainTokenObject = {
    id: string;
    symbol: string;
    name: string;
    decimals: number;
    image: string;
    coingecko_id: string;
    addresses: string[];
    native_chain: string;
    chains: Record<string, AxelarInterchainTokenChainObject>;
};
