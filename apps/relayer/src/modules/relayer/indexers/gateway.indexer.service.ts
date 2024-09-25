import { Inject, Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { RelayerService } from "../relayer.service";
import axelarChains from "../../../config/axelar-chains.json";
import { EthersTypechainContractIndexer } from "@bloxer/ethers-typechain-contract";
import { AxelarAmplifierGatewayProxyContractFactory } from "./factories/gateway-contract-factory";

@Injectable()
export class GatewayIndexerService implements OnApplicationBootstrap {
    constructor(@Inject(RelayerService) private readonly relayerService: RelayerService) {}

    /**
     * On application bootstrap, we want to start the indexer.
     */
    async onApplicationBootstrap() {
        const supportedChains = ["xrpl-evm-sidechain", "avalanche-fuji"];
        for (const chain of supportedChains) {
            // @ts-ignore
            const gatewayIndexer = new EthersTypechainContractIndexer(
                // @ts-ignore
                axelarChains.chains[chain].contracts.AxelarGateway.address,
                AxelarAmplifierGatewayProxyContractFactory as any,
                {
                    // @ts-ignore
                    wsUrl: axelarChains.chains[chain].ws,
                    persistState: false,
                    logger: {
                        minLevel: 0,
                        name: `${chain}-gateway-indexer`,
                    },
                    startingBlock: 11400000,
                },
            );

            // @ts-ignore
            gatewayIndexer.on("ContractCall", async (event) => {
                await this.relayerService.verifyMessages(
                    event.transactionHash,
                    event.logIndex,
                    chain, // sourceChain
                    event.args[0], // sourceAddress
                    event.args[1], // destinationChain
                    event.args[2], // destinationContractAddress
                    event.args[3].slice(2), // payloadHash
                    event.args[4], // payload
                );
            });

            // @ts-ignore
            gatewayIndexer.on("MessageApproved", async (event) => {
                await this.relayerService.executeMessage(
                    event.transactionHash,
                    event.logIndex,
                    event.args[0], // commandId
                    event.args[1], // sourceChain
                    event.args[2], // messageId
                    event.args[3], // sourceAddress
                    event.args[4], // contractAddress
                    event.args[5], // payloadHash
                );
            });

            gatewayIndexer.run();
        }
    }
}
