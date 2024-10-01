import { IBridgeTokenController } from "../../../ui/interfaces/i-bridge-token.controller";
import { Controller } from "@frontend/core/domain/controller";
import { IBridgeTokenService } from "../../interfaces/i-bridge-tokens.service";
import { Chain } from "@frontend/chain";
import { BridgeToken } from "../../../common";
import { IBridgeTokenState } from "../../states/bridge-token.state";
import { IBridgeChainsController } from "../../../ui/interfaces/i-bridge-chains.controller";
import { State } from "@frontend/core/domain/state";
import { IBridgeChainsState } from "../../states";
import Amount from "@shared/amount";
import { ProviderFactory } from "@frontend/blockchain/providers";
import { BridgeTokenErrors } from "../../errors/bridge-token.errors";

@Controller()
export class BridgeTokenController implements IBridgeTokenController {
    constructor(
        private readonly bridgeTokenService: IBridgeTokenService,
        private readonly bridgeChainsController: IBridgeChainsController,
        private readonly bridgeTokenState: State<IBridgeTokenState>,
    ) {}

    /**
     * Initializes the bridge token controller.
     */
    onInit(): void {
        this.bridgeChainsController.on("bridgeChainsChange", (chains, prevChains) => this.handleBridgeChainsLoad(chains, prevChains));
        this.bridgeChainsController.on("bridgeChainsLoad", (chains) => this.handleBridgeChainsLoad(chains));
    }

    /**
     * Handles the bridge chains change.
     * @param chains The new bridge chains.
     * @param prevChains The previous bridge chains.
     */
    private async handleBridgeChainsLoad(chains: IBridgeChainsState, prevChains?: IBridgeChainsState) {
        if ((!chains.originChain || !chains.destinationChain) && this.bridgeTokenState.getState()) {
            this.setBridgeToken(undefined);
        } else if (
            chains.originChain &&
            chains.destinationChain &&
            ((chains.originChain !== prevChains?.originChain && chains.originChain !== prevChains?.destinationChain) ||
                (chains.destinationChain !== prevChains?.originChain && chains.destinationChain !== prevChains?.destinationChain))
        ) {
            const tokens = await this.bridgeTokenService.getBridgeTokens(chains.originChain, chains.destinationChain);
            const nativeToken = tokens.find((token) => token.symbol === chains.originChain!.nativeToken.symbol);
            this.setBridgeToken(nativeToken || tokens[0]);
        }
    }

    /**
     * Gets the bridge tokens for the given chain pair.
     * @param chain The chain.
     * @param otherChain The other chain.
     * @param query The query.
     * @returns The bridge tokens.
     */
    getBridgeTokens(chain: Chain, otherChain: Chain, query?: string): Promise<BridgeToken[]> {
        return this.bridgeTokenService.getBridgeTokens(chain, otherChain, query);
    }

    /**
     * Sets the bridge token.
     * @param token The bridge token.
     */
    setBridgeToken(token: BridgeToken | undefined): void {
        this.bridgeTokenState.setState({ bridgeToken: token });
    }

    /**
     * Gets the bridge token.
     * @returns The bridge token.
     */
    getBridgeToken(): BridgeToken {
        const bridgeToken = this.bridgeTokenState.getState().bridgeToken;
        if (!bridgeToken) throw new Error(BridgeTokenErrors.BRIDGE_TOKEN_NOT_SET);
        return bridgeToken;
    }

    /**
     * Gets the chain bridge token balance.
     * @param address The address of the account.
     * @param chain The chain.
     * @param token The token.
     * @returns The balance amount.
     */
    async getChainBridgeTokenBalance(address: string, chain: Chain, token: BridgeToken): Promise<Amount> {
        const provider = ProviderFactory(chain);
        const chainToken = token.toChainToken(chain.id);
        const balance = await provider.getTokenBalance(address, chainToken);

        return Amount.fromInt(balance, chainToken.decimals, chainToken.symbol);
    }
}
