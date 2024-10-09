import { Inject, Injectable, OnApplicationBootstrap } from "@nestjs/common";
import axelarChains from "../../../config/axelar-chains.json";
import { EthersTypechainContractIndexer } from "@bloxer/ethers-typechain-contract";
import { AxelarAmplifierGatewayProxyContractFactory } from "./factories/gateway-contract-factory";
import { ConfigService } from "@nestjs/config";
import { GmpRelayerXrplEvmService } from "../gmp-relayer.xrpl-evm.service";

@Injectable()
export class GatewayIndexerService implements OnApplicationBootstrap {
    private readonly supportedChains: string[];

    constructor(
        @Inject(ConfigService) private readonly configService: ConfigService,
        // private readonly gmpRelayerService: GmpRelayerEvmService,
        private readonly gmpRelayerXrplEvmService: GmpRelayerXrplEvmService,
    ) {
        this.supportedChains = this.configService.get<string[]>("axelar.supportedChains")!;
    }

    /**
     * On application bootstrap, we want to start the indexer.
     */
    async onApplicationBootstrap() {
        for (const chain of this.supportedChains) {
            // @ts-ignore
            const gatewayIndexer = new EthersTypechainContractIndexer(
                // @ts-ignore
                axelarChains.chains[chain].contracts.AxelarGateway.address,
                AxelarAmplifierGatewayProxyContractFactory as any,
                {
                    // @ts-ignore
                    wsUrl: this.configService.get("axelar.chainWebsockets")[chain],
                    persistState: false,
                    logger: {
                        minLevel: 4,
                        name: `${chain}-gateway-indexer`,
                    },
                    startingBlock: "latest",
                },
            );

            // @ts-ignore
            gatewayIndexer.on("ContractCall", async (event) => {
                await this.gmpRelayerXrplEvmService.relayEvmToXrpl(
                    {
                        sourceChain: chain,
                        sourceAddress: event.args[0],
                        messageId: `${event.transactionHash}-${event.logIndex}`,
                        payload: event.args[4],
                        payloadHash: event.args[3].slice(2),
                        destinationChain: event.args[1],
                        destinationAddress: event.args[2],
                    },
                    event.transactionHash,
                );
            });

            gatewayIndexer.run();
        }
    }
}
