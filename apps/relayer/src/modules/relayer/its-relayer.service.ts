import { Inject, Injectable, Logger } from "@nestjs/common";
import { RelayerEvmRequest } from "./requests/relayer-evm.request";
import { ConfigService } from "@nestjs/config";
import { execSync } from "child_process";
import axelarChains from "../../config/axelar-chains.json";
import { RelayerXrplRequest } from "./requests/relayer-xrpl.request";
import { ethers } from "ethers";
import { dropsToXrp } from "xrpl";

@Injectable()
export class ItsRelayerService {
    private readonly axelarChainId: string;
    private readonly axelarRpc: string;
    private readonly logger: Logger;
    private readonly xrplTokenId: string;
    constructor(@Inject(ConfigService) private readonly configService: ConfigService) {
        this.logger = new Logger(ItsRelayerService.name);
        this.axelarChainId = this.configService.get<string>("axelar.chainId")!;
        this.axelarRpc = this.configService.get<string>("axelar.rpcUrl")!;
        this.xrplTokenId = this.configService.get<string>("axelar.tokenIds.xrpl")!;
    }

    /**
     * Execute the ITS Hub.
     * @param sourceChain The source chain.
     * @param messageId The message ID.
     * @param payload The payload.
     * @returns The contract call log.
     */
    async execute(sourceChain: string, messageId: string, payload: string): Promise<any> {
        const axelarnetGateway = axelarChains.axelar.contracts.AxelarnetGateway.address;

        // 00. Verify the message
        this.logger.log(`Executing ITS Hub message ${messageId} on ${sourceChain}`);
        const contractCall = {
            execute: {
                cc_id: {
                    source_chain: sourceChain,
                    message_id: messageId,
                },
                payload: payload.slice(2),
            },
        };

        const res = execSync(
            `axelard tx wasm execute ${axelarnetGateway} '${JSON.stringify(contractCall)}' ${this.axelarCmdTransactionFlags()}`,
        );
        const jsonResponse = JSON.parse(res.toString());
        return jsonResponse.logs[0].events.find((log: any) => log.type === "wasm-contract_called");
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
        const contractCallLog = await this.execute(relayerRequest.sourceChain, relayerRequest.messageId, relayerRequest.payload);
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

    /**
     * Execute the ITS Hub.
     * @param relayerRequest The relayer request.
     * @returns The relayer request.
     */
    async executeItsHubXrpl(relayerRequest: RelayerXrplRequest): Promise<RelayerXrplRequest> {
        const interchainTransfer = {
            messageType: ethers.BigNumber.from("0"),
            tokenId: this.xrplTokenId, // XRP token ID
            sourceAddress: `0x${relayerRequest.userRequest.sourceAddress}`,
            destinationAddress: `0x${relayerRequest.userRequest.destinationAddress}`,
            amount: ethers.utils.parseUnits(dropsToXrp(relayerRequest.userRequest.amount).toString()),
            data: "0x",
        };

        const abiCoder = new ethers.utils.AbiCoder();

        const messageEncoded = abiCoder.encode(
            ["uint256", "bytes32", "bytes", "bytes", "uint256", "bytes"],
            [
                interchainTransfer.messageType,
                interchainTransfer.tokenId,
                interchainTransfer.sourceAddress,
                interchainTransfer.destinationAddress,
                interchainTransfer.amount,
                interchainTransfer.data,
            ],
        );

        const hubMessage = abiCoder.encode(
            ["uint256", "string", "bytes"],
            [ethers.BigNumber.from("3"), relayerRequest.userRequest.destinationChain, messageEncoded],
        );

        // Update the payload in the relayerRequest
        relayerRequest.userRequest.payload = hubMessage;

        // ... rest of the exi

        const contractCallLog = await this.execute(
            relayerRequest.sourceChain,
            `0x${relayerRequest.userRequest.txId.toLowerCase()}-0`,
            relayerRequest.userRequest.payload,
        );

        return {
            sourceChain: relayerRequest.sourceChain,
            userRequest: {
                destinationAddress: contractCallLog.attributes.find((attr: any) => attr.key === "destination_address").value,
                destinationChain: contractCallLog.attributes.find((attr: any) => attr.key === "destination_chain").value,
                txId: contractCallLog.attributes.find((attr: any) => attr.key === "message_id").value,
                payload: contractCallLog.attributes.find((attr: any) => attr.key === "payload").value,
                payloadHash: contractCallLog.attributes.find((attr: any) => attr.key === "payload_hash").value,
                sourceAddress: contractCallLog.attributes.find((attr: any) => attr.key === "source_address").value,
                amount: relayerRequest.userRequest.amount,
            },
        };
    }
}
