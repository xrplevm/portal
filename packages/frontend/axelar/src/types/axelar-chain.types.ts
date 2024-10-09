export type AxelarChainEndpointsObject = {
    rpc?: string[];
    ws?: string[];
    faucet?: string[];
};

export type AxelarChainNativeTokenObject = {
    name: string;
    symbol: string;
    decimals: number;
};

export type AxelarChainExplorerObject = {
    name: string;
    url: string;
    icon: string;
    block_path: string;
    address_path: string;
    contract_path: string;
    transaction_path: string;
};

export type AxelarChainProviderParamObject = {
    chainId: string;
    chainName: string;
    rpcUrls: string[];
    nativeCurrency: AxelarChainNativeTokenObject;
    blockExplorerUrls: string[];
};

export type AxelarChainObject = {
    chain_id?: number;
    chain_name: string;
    maintainer_id: string;
    endpoints: AxelarChainEndpointsObject;
    native_token: AxelarChainNativeTokenObject;
    name: string;
    short_name: string;
    image: string;
    color: string;
    explorer: AxelarChainExplorerObject;
    id: string;
    chain_type: string;
    provider_params?: Array<AxelarChainProviderParamObject>;
    no_inflation?: boolean;
    no_tvl?: boolean;
    interchain_token_service_contract?: string;
    interchain_token_service_gateway?: string;
};
