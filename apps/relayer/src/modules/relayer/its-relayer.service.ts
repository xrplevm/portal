import { Inject, Injectable, Logger } from "@nestjs/common";
import { RelayerEvmRequest } from "./requests/relayer-evm.request";
import { ConfigService } from "@nestjs/config";
import { execSync } from "child_process";
import axelarChains from "../../config/axelar-chains.json";

@Injectable()
export class ItsRelayerService {
    private readonly axelarChainId: string;
    private readonly axelarRpc: string;
    private readonly logger: Logger;

    constructor(@Inject(ConfigService) private readonly configService: ConfigService) {
        this.logger = new Logger(ItsRelayerService.name);
        this.axelarChainId = this.configService.get<string>("axelar.chainId")!;
        this.axelarRpc = this.configService.get<string>("axelar.rpcUrl")!;
    }

    /**
     * Axelar command transaction flags.
     * @returns The transaction flags.
     */
    axelarCmdTransactionFlags(): string {
        return `--keyring-backend test --from wallet --gas 20000000 --gas-adjustment 1.5 --gas-prices 0.00005uamplifier --chain-id ${this.axelarChainId} --node ${this.axelarRpc}`;
    }

    /**
     * Execute the ITS Hub.
     * @param relayerRequest The relayer request.
     * @returns The relayer request.
     */
    async executeItsHub(relayerRequest: RelayerEvmRequest): Promise<RelayerEvmRequest> {
        const axelarnetGateway = axelarChains.axelar.contracts.AxelarnetGateway.address;

        // 00. Verify the message
        this.logger.log(`Executing ITS Hub message ${relayerRequest.messageId} on ${relayerRequest.sourceChain}`);
        const contractCall = {
            execute: {
                cc_id: {
                    source_chain: relayerRequest.sourceChain,
                    message_id: relayerRequest.messageId,
                },
                payload: relayerRequest.payload.slice(2),
            },
        };

        const res = execSync(
            `axelard tx wasm execute ${axelarnetGateway} '${JSON.stringify(contractCall)}' ${this.axelarCmdTransactionFlags()}`,
        );
        const jsonResponse = JSON.parse(res.toString());
        const contractCallLog = jsonResponse.logs[0].events.find((log: any) => log.type === "wasm-contract_called");
        return {
            destinationAddress: contractCallLog.attributes.find((attr: any) => attr.key === "destination_address").value,
            destinationChain: contractCallLog.attributes.find((attr: any) => attr.key === "destination_chain").value,
            messageId: contractCallLog.attributes.find((attr: any) => attr.key === "message_id").value,
            payload: contractCallLog.attributes.find((attr: any) => attr.key === "payload").value,
            payloadHash: contractCallLog.attributes.find((attr: any) => attr.key === "payload_hash").value,
            sourceAddress: contractCallLog.attributes.find((attr: any) => attr.key === "source_address").value,
            sourceChain: contractCallLog.attributes.find((attr: any) => attr.key === "source_chain").value,
        };
    }
}
