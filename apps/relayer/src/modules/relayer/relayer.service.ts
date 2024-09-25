import { Inject, Injectable, Logger } from "@nestjs/common";
import { RelayerEvmRequest } from "./requests/relayer-evm.request";
import { ConfigService } from "@nestjs/config";
import { execSync } from "child_process";
import axelarChains from "../../config/axelar-chains.json";
import { ethers, providers, Wallet } from "ethers";
import { RelayerXrplRequest } from "./requests/relayer-xrpl.request";

@Injectable()
export class RelayerService {
    private readonly axelarChainId: string;
    private readonly axelarRpc: string;
    private readonly verifyWaitTime: number;
    private readonly proveWaitTime: number;
    private readonly privateKey: string;

    constructor(@Inject(ConfigService) private readonly configService: ConfigService) {
        this.axelarChainId = this.configService.get<string>("axelar.chainId")!;
        this.axelarRpc = this.configService.get<string>("axelar.rpcUrl")!;
        this.verifyWaitTime = this.configService.get<number>("axelar.verifyWaitTime")!;
        this.proveWaitTime = this.configService.get<number>("axelar.proveWaitTime")!;
        this.privateKey = this.configService.get<string>("axelar.privateKey")!;
    }

    /**
     * Verify the messages.
     * @param hash The hash.
     * @param i The index.
     * @param sourceChain The source chain.
     * @param sourceAddress The source address.
     * @param destinationChain The destination chain.
     * @param destinationContractAddress The destination contract address.
     * @param payloadHash The payload hash.
     * @param payload The payload.
     */
    // TODO: Implement
    async verifyMessages(
        hash: string,
        i: number,
        sourceChain: string,
        sourceAddress: string,
        destinationChain: string,
        destinationContractAddress: string,
        payloadHash: string,
        payload: string,
    ) {
        console.log(
            "verifyMessages",
            hash,
            i,
            sourceChain,
            sourceAddress,
            destinationChain,
            destinationContractAddress,
            payloadHash,
            payload,
        );
    }

    /**
     * Execute the message.
     * @param txHash The transaction hash.
     * @param logIndex The log index.
     * @param commandId The command ID.
     * @param sourceChain The source chain.
     * @param messageId The message ID.
     * @param sourceAddress The source address.
     * @param contractAddress The contract address.
     * @param payloadHash The payload hash.
     */
    // TODO: Implement
    async executeMessage(
        txHash: string,
        logIndex: number,
        commandId: string,
        sourceChain: string,
        messageId: string,
        sourceAddress: string,
        contractAddress: string,
        payloadHash: string,
    ) {
        console.log("executeMessage", txHash, logIndex, commandId, sourceChain, messageId, sourceAddress, contractAddress, payloadHash);
    }

    /**
     * Axelar command transaction flags.
     * @returns The transaction flags.
     */
    axelarCmdTransactionFlags(): string {
        return `--keyring-backend test --from wallet --gas 20000000 --gas-adjustment 1.5 --gas-prices 0.00005uamplifier --chain-id ${this.axelarChainId} --node ${this.axelarRpc}`;
    }

    /**
     * Resolve the message ID for an EVM message.
     * @param relayerRequest The relayer request.
     * @returns The message ID.
     */
    async resolveEvmMessage(relayerRequest: RelayerEvmRequest): Promise<string> {
        // @ts-ignore
        const sourceChainGateway = axelarChains.axelar.contracts.Gateway[relayerRequest.sourceChain].address;
        const messageId = `${relayerRequest.txHash}-${relayerRequest.txEvent}`;

        // 00. Verify the message
        Logger.log(`Verifying message ${messageId} on ${relayerRequest.sourceChain}`);
        const contractCall = {
            verify_messages: [
                {
                    cc_id: {
                        source_chain: relayerRequest.sourceChain,
                        message_id: messageId,
                    },
                    destination_chain: relayerRequest.destinationChain,
                    destination_address: relayerRequest.destinationAddress,
                    source_address: relayerRequest.sourceAddress,
                    payload_hash: relayerRequest.payloadHash,
                },
            ],
        };

        execSync(`axelard tx wasm execute ${sourceChainGateway} '${JSON.stringify(contractCall)}' ${this.axelarCmdTransactionFlags()}`, {
            stdio: "inherit",
        });

        await new Promise((resolve) => setTimeout(resolve, this.verifyWaitTime));

        Logger.log(`Routing message ${messageId} on ${relayerRequest.destinationChain}`);
        // 01. Route the message
        const routeMessageCall = {
            route_messages: [
                {
                    cc_id: {
                        source_chain: relayerRequest.sourceChain,
                        message_id: messageId,
                    },
                    destination_chain: relayerRequest.destinationChain,
                    destination_address: relayerRequest.destinationAddress,
                    source_address: relayerRequest.sourceAddress,
                    payload_hash: relayerRequest.payloadHash,
                },
            ],
        };
        execSync(
            `axelard tx wasm execute ${sourceChainGateway} '${JSON.stringify(routeMessageCall)}' ${this.axelarCmdTransactionFlags()}`,
            {
                stdio: "inherit",
            },
        );

        Logger.log(`Constructing proof for message ${messageId} on ${relayerRequest.destinationChain}`);
        // 02. Construct proof
        // @ts-ignore
        const destinationChainMultisigProver = axelarChains.axelar.contracts.MultisigProver[relayerRequest.destinationChain].address;
        const constructProofCall = {
            construct_proof: [
                {
                    source_chain: relayerRequest.sourceChain,
                    message_id: messageId,
                },
            ],
        };
        const response = execSync(
            `axelard tx wasm execute ${destinationChainMultisigProver} '${JSON.stringify(constructProofCall)}' ${this.axelarCmdTransactionFlags()}`,
        );
        const responseJson = JSON.parse(response.toString());

        const log = responseJson.logs[0].events.find((log: any) => log.type === "wasm-proof_under_construction");
        const attribute = log.attributes.find((attr: any) => attr.key === "multisig_session_id");
        const multisigSessionId = attribute.value.replace(/"/g, "");

        await new Promise((resolve) => setTimeout(resolve, this.proveWaitTime));

        Logger.log(
            `Getting proof for message ${messageId} on ${relayerRequest.destinationChain} with multisig session id ${multisigSessionId}`,
        );
        const getProofCall = {
            proof: {
                multisig_session_id: multisigSessionId,
            },
        };
        const rawProof = execSync(
            `axelard q wasm contract-state smart ${destinationChainMultisigProver} '${JSON.stringify(getProofCall)}' --output json --node ${this.axelarRpc}`,
        );
        const proof = JSON.parse(rawProof.toString());

        return proof.data.status.completed.execute_data;
    }

    /**
     * Resolve the message ID for an XRPL message.
     * @param relayerRequest The relayer request.
     * @returns The message ID.
     */
    async resolveXrplMessage(relayerRequest: RelayerXrplRequest): Promise<void> {
        // @ts-ignore
        const sourceChainGateway = axelarChains.axelar.contracts.Gateway[relayerRequest.sourceChain].address;
        const messageId = `${relayerRequest.userRequest.txId}`;
        const txIdBytes = ethers.utils.toUtf8Bytes(relayerRequest.userRequest.txId);

        // 00. Verify the message
        Logger.log(`Verifying message ${messageId} on ${relayerRequest.sourceChain}`);
        const contractCall = {
            verify_messages: [
                {
                    user_messsage: {
                        tx_id: txIdBytes,
                        amount: {
                            drops: relayerRequest.userRequest.amount,
                        },
                        source_address: relayerRequest.userRequest.sourceAddress,
                        destination_address: relayerRequest.userRequest.destinationAddress,
                        destination_chain: relayerRequest.userRequest.destinationChain,
                        payload_hash: relayerRequest.userRequest.payloadHash,
                    },
                },
            ],
        };

        execSync(`axelard tx wasm execute ${sourceChainGateway} '${JSON.stringify(contractCall)}' ${this.axelarCmdTransactionFlags()}`, {
            stdio: "inherit",
        });

        await new Promise((resolve) => setTimeout(resolve, this.verifyWaitTime));
    }

    /**
     * Relay the request.
     * @param relayerRequest The relayer request.
     */
    async relayEvmToEvm(relayerRequest: RelayerEvmRequest): Promise<void> {
        // @ts-ignore
        const executeData = await this.resolveEvmMessage(relayerRequest);
        const messageId = `${relayerRequest.txHash}-${relayerRequest.txEvent}`;
        await this.sendProofToEvm(executeData, messageId, relayerRequest.destinationChain);
    }

    /**
     * Relay the request.
     * @param relayerRequest The relayer request.
     */
    async relayXrplToEvm(relayerRequest: RelayerXrplRequest): Promise<void> {
        await this.resolveXrplMessage(relayerRequest);

        // TODO: Implement xrpl execution
    }

    /**
     * Relay the request.
     * @param _relayerRequest The relayer request.
     */
    async relayEvmToXrpl(_relayerRequest: RelayerEvmRequest): Promise<void> {
        // TODO: Implement

        await this.resolveEvmMessage(_relayerRequest);
    }

    /**
     * Send the proof to the Axelar Gateway on the destination chain.
     * @param executeData The execute data from the Axelar Multisig Prover.
     * @param messageId The message ID.
     * @param destinationChain The destination chain.
     */
    async sendProofToEvm(executeData: any, messageId: string, destinationChain: string) {
        // @ts-ignore
        const provider = new providers.JsonRpcProvider(axelarChains.chains[destinationChain].rpc);
        const wallet = new Wallet(this.privateKey, provider);
        // @ts-ignore
        const gatewayAddress = axelarChains.chains[destinationChain].contracts.AxelarGateway.address;
        Logger.log(`Sending proof for message ${messageId} on ${destinationChain} with execute data ${executeData}`);
        await wallet
            .sendTransaction({ to: gatewayAddress, data: "0x" + executeData, gasLimit: ethers.BigNumber.from(120_000) })
            .then((tx) => tx.wait());
    }
}
