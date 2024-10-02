import { Chain } from "@frontend/chain";
import { AxelarErrors } from "./axelar.errors";
import { IConfigManager } from "@frontend/config";
import { GetChainsResponse } from "./responses/get-chains.response";
import { AxelarChain } from "./models/axelar-chain";
import { ServiceError } from "@frontend/core/data-access/service/error";
import { IAxelarService } from "./interfaces";
import { Service } from "@frontend/core/data-access/service";
import { deepmerge } from "@shared/utils";
import { AxelarChainObject } from "./types/axelar-chain.types";
import { BridgeToken } from "@frontend/bridge";
import { GetITSAssetsResponse } from "./responses/get-it-assets.response";
import { AxelarInterchainToken } from "./models/axelar-interchain-token";
import { AxelarInterchainTokenObject } from "./types/axelar-interchain-token.types";
import { AxelarGMPTransferContractMethod, AxelarGMPTransfersObject } from "./types/axelar-gmp.types";
import { PaginatedAxelarTransfers } from "./models/axelar-paginated-transfers";
import { PaginatedTransfers } from "@frontend/activity";

@Service()
export class AxelarService implements IAxelarService {
    constructor(private readonly configManager: IConfigManager) {}

    private get url(): string {
        return this.configManager.get("axelar.url");
    }

    private get apiUrl(): string {
        return this.configManager.get("axelar.apiUrl");
    }

    private get gmpUrl(): string {
        return this.configManager.get("axelar.gmpUrl");
    }

    /**
     * Get all the chains supported by Axelar.
     * @returns The list of chains supported by Axelar.
     */
    async getChains(): Promise<Chain[]> {
        const response = await fetch(`${this.apiUrl}/getChains`, { headers: { "Content-Type": "application/json" } });

        if (!response.ok) {
            throw new ServiceError(AxelarErrors.GET_CHAINS_FETCH_ERROR);
        }

        try {
            const axelarChains = (await response.json()) as GetChainsResponse;

            const extraChains = this.configManager.get("axelar.extraChains");
            axelarChains.push(...(extraChains as AxelarChainObject[]));

            const interchainTokenServiceContract = this.configManager.get("axelar.interchainTokenServiceContract");
            const chainIds = this.configManager.get("axelar.chainIds");
            const additionalChainData = this.configManager.get("axelar.additionalChainData");

            const chains = axelarChains.reduce((prev, axelarChain) => {
                try {
                    if (chainIds[axelarChain.id]) {
                        let chainData = axelarChain;
                        chainData.interchain_token_service_contract = interchainTokenServiceContract;
                        if (additionalChainData[axelarChain.id]) chainData = deepmerge(axelarChain, additionalChainData[axelarChain.id]);

                        const chain = new AxelarChain(chainData, this.url).toChain();
                        prev.push(chain);
                    }
                } catch (_) {
                    // If the chain can't be parsed, skip it.
                }
                return prev;
            }, [] as Chain[]);

            return chains;
        } catch (_) {
            throw new ServiceError(AxelarErrors.GET_CHAINS_PARSE_ERROR);
        }
    }

    /**
     * Checks if the token matches the query.
     * @param token The token to check.
     * @param query The query to check against.
     * @returns True if the token matches the query, false otherwise.
     */
    private tokenMatchesQuery(token: AxelarInterchainTokenObject, query?: string): boolean {
        if (!query) return true;
        const queryLower = query.toLowerCase();
        return (
            token.name.toLowerCase().includes(queryLower) ||
            token.symbol.toLowerCase().includes(queryLower) ||
            token.addresses.some((address) => address.toLowerCase() === queryLower)
        );
    }

    /**
     * Get the bridge tokens for a given chain pair.
     * @param chain The chain to get the bridge tokens for.
     * @param otherChain The other chain to get the bridge tokens for.
     * @param query The query to filter the tokens.
     * @returns The bridge tokens for the given chain pair.
     */
    async getBridgeTokens(chain: Chain, otherChain: Chain, query?: string): Promise<BridgeToken[]> {
        const response = await fetch(`${this.apiUrl}/getITSAssets`, { headers: { "Content-Type": "application/json" } });

        if (!response.ok) {
            throw new ServiceError(AxelarErrors.GET_BRIDGE_TOKENS_FETCH_ERROR);
        }

        try {
            const axelarInterchainTokens = (await response.json()) as GetITSAssetsResponse;

            const extraTokens = this.configManager.get("axelar.extraTokens");
            axelarInterchainTokens.push(...(extraTokens as AxelarInterchainTokenObject[]));

            const additionalTokenData = this.configManager.get("axelar.additionalTokenData");

            const tokens = axelarInterchainTokens.reduce((prev, axelarInterchainToken) => {
                try {
                    let tokenData = axelarInterchainToken;
                    if (additionalTokenData[axelarInterchainToken.id])
                        tokenData = deepmerge(axelarInterchainToken, additionalTokenData[axelarInterchainToken.id]);

                    if (tokenData.chains[chain.id] && tokenData.chains[otherChain.id] && this.tokenMatchesQuery(tokenData, query)) {
                        const token = new AxelarInterchainToken(tokenData, this.url).toBridgeToken(chain);
                        prev.push(token);
                    }
                } catch (_) {
                    // If the token can't be parsed, skip it.
                }
                return prev;
            }, [] as BridgeToken[]);

            return tokens;
        } catch (_) {
            throw new ServiceError(AxelarErrors.GET_BRIDGE_TOKENS_PARSE_ERROR);
        }
    }

    /**
     * Get paginated transfers.
     * @param page The page number.
     * @param pageSize The page size.
     * @param sourceChain The source chain.
     * @param destinationChain The destination chain.
     * @param sender The sender.
     * @returns The paginated transfers.
     */
    async getPaginatedTransfers(
        page: number,
        pageSize: number,
        sourceChain?: string,
        destinationChain?: string,
        sender?: string,
    ): Promise<PaginatedTransfers> {
        const response = await fetch(`${this.gmpUrl}/searchGMP`, {
            headers: { "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({
                size: pageSize,
                from: (page - 1) * pageSize,
                sourceChain,
                destinationChain,
                contractMethod: AxelarGMPTransferContractMethod.INTERCHAIN_TRANSFER,
                senderAddress: sender,
            }),
        });
        if (!response.ok) throw new ServiceError(AxelarErrors.GET_PAGINATED_TRANSFERS_FETCH_ERROR);

        try {
            const data = (await response.json()) as AxelarGMPTransfersObject;

            return new PaginatedAxelarTransfers(data, page, pageSize, this.url).toPaginatedTransfers();
        } catch (_) {
            throw new ServiceError(AxelarErrors.GET_PAGINATED_TRANSFERS_PARSE_ERROR);
        }
    }
}
