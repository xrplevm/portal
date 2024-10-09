import { Chain } from "@frontend/chain";
import { ChainType } from "@shared/modules/chain";
import {
    AxelarChainEndpointsObject,
    AxelarChainExplorerObject,
    AxelarChainNativeTokenObject,
    AxelarChainObject,
    AxelarChainProviderParamObject,
} from "../types/axelar-chain.types";
import { getAxelarResourceUrl } from "../utils/get-axelar-resource-url";

export class AxelarChain {
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

    constructor(axelarChain: AxelarChainObject, axelarUrl: string) {
        this.chain_id = axelarChain.chain_id;
        this.chain_name = axelarChain.chain_name;
        this.maintainer_id = axelarChain.maintainer_id;
        this.endpoints = axelarChain.endpoints;
        this.native_token = axelarChain.native_token;
        this.name = axelarChain.name;
        this.short_name = axelarChain.short_name;
        this.image = getAxelarResourceUrl(axelarChain.image, axelarUrl);
        this.color = axelarChain.color;
        this.explorer = { ...axelarChain.explorer, icon: getAxelarResourceUrl(axelarChain.explorer.icon, axelarUrl) };
        this.id = axelarChain.id;
        this.chain_type = axelarChain.chain_type;
        this.provider_params = axelarChain.provider_params;
        this.no_inflation = axelarChain.no_inflation;
        this.no_tvl = axelarChain.no_tvl;
        this.interchain_token_service_contract = axelarChain.interchain_token_service_contract;
        this.interchain_token_service_gateway = axelarChain.interchain_token_service_gateway;
    }

    /**
     * Get the chain type from the chain_type string.
     * @returns The chain type.
     */
    private getChainType(): ChainType {
        if (this.id === "xrpl") {
            return ChainType.XRP;
        } else if (this.chain_type === "evm" || this.chain_type === "vm") {
            return ChainType.EVM;
        }

        throw new Error(`Unsupported chain type: ${this.chain_type}`);
    }

    /**
     * Convert the AxelarChain to a Chain.
     * @returns The Chain.
     */
    toChain(): Chain {
        return new Chain({
            id: this.id,
            name: this.name,
            symbol: this.short_name,
            chainId: this.chain_id,
            image: this.image,
            type: this.getChainType(),
            nativeToken: {
                symbol: this.native_token.symbol,
                decimals: this.native_token.decimals,
                name: this.native_token.name,
            },
            door: (this.interchain_token_service_gateway || this.interchain_token_service_contract)!,
            urls: {
                rpc: this.endpoints.rpc?.[0],
                ws: this.endpoints.ws?.[0],
                faucet: this.endpoints.faucet?.[0],
            },
            explorer: {
                name: this.explorer.name,
                url: this.explorer.url,
                image: this.explorer.icon,
                paths: {
                    block: this.explorer.block_path,
                    address: this.explorer.address_path,
                    token: this.explorer.contract_path,
                    transaction: this.explorer.transaction_path,
                },
            },
        });
    }
}
