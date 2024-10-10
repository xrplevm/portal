import { Injectable, Logger } from "@nestjs/common";
import { RelayerEvmRequest } from "./requests/relayer-evm.request";
import axelarChains from "../../config/axelar-chains.json";
import { ConfigService } from "@nestjs/config";
import { execSync } from "child_process";
import { Client, SubmitRequest } from "xrpl";
import { sleep } from "../common/utils/sleep";

// import { ItsRelayerService } from "./its-relayer.service";

@Injectable()
export class GmpRelayerXrplEvmService {
    private readonly axelarChainId: string;
    private readonly axelarRpc: string;
    private readonly verifyWaitTime: number;
    private readonly proveWaitTime: number;
    private readonly externalRelayWaitTime: number;
    // private readonly privateKey: string;
    private readonly externalRelayedChains: string[];
    // private readonly itsGasLimit: number;
    private readonly logger: Logger;

    constructor(
        private readonly configService: ConfigService,
        // private readonly itsRelayerService: ItsRelayerService,
    ) {
        this.axelarChainId = this.configService.get<string>("axelar.chainId")!;
        this.axelarRpc = this.configService.get<string>("axelar.rpcUrl")!;
        this.verifyWaitTime = this.configService.get<number>("axelar.verifyWaitTime")!;
        this.proveWaitTime = this.configService.get<number>("axelar.proveWaitTime")!;
        this.externalRelayWaitTime = this.configService.get<number>("axelar.externalRelayWaitTime")!;
        // this.privateKey = this.configService.get<string>("axelar.privateKey")!;
        this.externalRelayedChains = this.configService.get<string[]>("axelar.externalRelayedChains")!;
        // this.itsGasLimit = this.configService.get<number>("axelar.itsGasLimit")!;
        this.logger = new Logger(GmpRelayerXrplEvmService.name);
    }
    /**
     * Axelar command transaction flags.
     * @returns The transaction flags.
     */
    axelarCmdTransactionFlags(): string {
        return `--keyring-backend test --from wallet --gas 20000000 --gas-adjustment 1.5 --gas-prices 0.00005uamplifier --chain-id ${this.axelarChainId} --node ${this.axelarRpc}`;
    }

    /**
     * Verify the messages.
     * @param relayerRequest The relayer request.
     * @param _ The transaction hash.
     */
    async verifyMessages(relayerRequest: RelayerEvmRequest, _: string): Promise<void> {
        //@ts-ignore
        const sourceChainGateway = axelarChains.axelar.contracts.Gateway[relayerRequest.sourceChain].address;

        // 00. Verify the message
        this.logger.log(`Verifying message ${relayerRequest.messageId} on ${relayerRequest.sourceChain}`);
        const contractCall = {
            verify_messages: [
                {
                    cc_id: {
                        source_chain: relayerRequest.sourceChain,
                        message_id: relayerRequest.messageId,
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

        // const abiCoder = new ethers.utils.AbiCoder();

        // const payloadDecoded = abiCoder.decode(["uint256", "string", "bytes"], relayerRequest.payload);

        // const interchainTransfer = abiCoder.decode(["uint256", "bytes32", "bytes", "bytes", "uint256", "bytes"], payloadDecoded[2]);
        // const routeMessageCall = {
        //     route_incoming_messages: [
        //         {
        //             payload: "",
        //             message: {
        //                 user_message: {
        //                     tx_id: Array.from(Uint8Array.from(Buffer.from(txHash.slice(2), "hex"))),
        //                     source_address: Array.from(Uint8Array.from(Buffer.from(interchainTransfer[3].slice(2), "hex"))),
        //                     destination_chain: relayerRequest.sourceChain,
        //                     destination_address: interchainTransfer[2].slice(2),
        //                     payload_hash: "0000000000000000000000000000000000000000000000000000000000000000",
        //                     amount: {
        //                         drops: Number(ethers.BigNumber.from(interchainTransfer[4].toString()).div(1000000000000).toString()),
        //                     },
        //                 },
        //             },
        //         },
        //     ],
        // };

        // // @ts-ignore
        // const destinationChainGateway = axelarChains.axelar.contracts.Gateway[payloadDecoded[1]].address;

        // this.logger.log(`Routing incoming message ${txHash} on ${payloadDecoded[1]}`);
        // execSync(
        //     `axelard tx wasm execute ${destinationChainGateway} '${JSON.stringify(routeMessageCall)}' ${this.axelarCmdTransactionFlags()}`,
        //     {
        //         stdio: "inherit",
        //     },
        // );
    }

    /**
     * Route the messages.
     * @param relayerRequest The relayer request.
     */
    async routeMessages(relayerRequest: RelayerEvmRequest): Promise<void> {
        //@ts-ignore
        const sourceChainGateway = axelarChains.axelar.contracts.AxelarnetGateway.address;
        this.logger.log(`Routing message ${relayerRequest.messageId} on ${relayerRequest.destinationChain}`);
        // 01. Route the message
        const routeMessageCall = {
            route_messages: [
                {
                    cc_id: {
                        source_chain: relayerRequest.sourceChain,
                        message_id: relayerRequest.messageId,
                    },
                    destination_chain: axelarChains.axelar.id,
                    destination_address: axelarChains.axelar.contracts.InterchainTokenService.address,
                    source_address: axelarChains.chains.xrpl.contracts.AxelarGateway.address,
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
    }

    /**
     * Construct the transfer proof.
     * @param relayerRequest The relayer request.
     * @returns The multisig session ID.
     */
    async constructTransferProofXrpl(relayerRequest: RelayerEvmRequest): Promise<string> {
        this.logger.log(`Constructing proof for message ${relayerRequest.messageId} on ${relayerRequest.destinationChain}`);
        // 02. Construct proof
        // @ts-ignore
        const destinationChainMultisigProver = axelarChains.axelar.contracts.MultisigProver["xrpl"].address;
        const constructProofCall = {
            construct_proof: {
                message_id: {
                    source_chain: axelarChains.axelar.id,
                    message_id: relayerRequest.messageId,
                },
                payload: relayerRequest.payload,
            },
        };
        const response = execSync(
            `axelard tx wasm execute ${destinationChainMultisigProver} '${JSON.stringify(constructProofCall)}' ${this.axelarCmdTransactionFlags()}`,
        );

        const responseJson = JSON.parse(response.toString());

        const log = responseJson.logs[0].events.find((log: any) => log.type === "wasm-proof_under_construction");
        const attribute = log.attributes.find((attr: any) => attr.key === "multisig_session_id");
        return attribute.value.replace(/"/g, "");
    }

    /**
     * Submit the proof to the Axelar Gateway.
     * @param txHash The transaction hash.
     */
    async submitProofXrpl(txHash: string): Promise<void> {
        const sourceChainGateway = axelarChains.axelar.contracts.Gateway["xrpl"].address;
        const routeMessageCall = {
            verify_messages: [
                {
                    prover_message: Array.from(Uint8Array.from(Buffer.from(txHash, "hex"))),
                },
            ],
        };
        execSync(
            `axelard tx wasm execute ${sourceChainGateway} '${JSON.stringify(routeMessageCall)}' ${this.axelarCmdTransactionFlags()}`,
            {
                stdio: "inherit",
            },
        );
    }

    /**
     * Update the transaction status.
     * @param multisigSessionId The multisig session ID.
     * @param txHash The transaction hash.
     * @param signerPublicKey The signer public key.
     */
    async updateTxStatusXrpl(multisigSessionId: string, txHash: string, signerPublicKey: string): Promise<void> {
        const destinationChainMultisigProver = axelarChains.axelar.contracts.MultisigProver["xrpl"].address;
        const updateTxStatusCall = {
            update_tx_status: {
                multisig_session_id: multisigSessionId,
                message_id: txHash.toUpperCase(),
                message_status: "succeeded_on_source_chain",
                signer_public_keys: [
                    {
                        ecdsa: signerPublicKey,
                    },
                ],
            },
        };

        execSync(
            `axelard tx wasm execute ${destinationChainMultisigProver} '${JSON.stringify(updateTxStatusCall)}' ${this.axelarCmdTransactionFlags()}`,
            {
                stdio: "inherit",
            },
        );
    }

    /**
     * Prove the transfer.
     * @param relayerRequest The relayer request.
     * @param multisigSessionId The multisig session ID.
     * @returns The transaction.
     */
    async proveTransferXrpl(relayerRequest: RelayerEvmRequest, multisigSessionId: string): Promise<void> {
        const destinationChainMultisigProver =
            //@ts-ignore
            axelarChains.axelar.contracts.MultisigProver["xrpl"].address;

        this.logger.log(`Getting proof for message ${relayerRequest.messageId} on ${relayerRequest.destinationChain}`);
        const getProofCall = {
            proof: {
                multisig_session_id: multisigSessionId,
            },
        };
        const rawProof = execSync(
            `axelard q wasm contract-state smart ${destinationChainMultisigProver} '${JSON.stringify(getProofCall)}' --output json --node ${this.axelarRpc}`,
        );
        const proof = JSON.parse(rawProof.toString());

        if (proof.data.status !== "completed") {
            this.logger.error(`Proof for message ${relayerRequest.messageId} on ${relayerRequest.destinationChain} is not completed`);
        }
        this.logger.log(`Proof for message ${relayerRequest.messageId} on ${relayerRequest.destinationChain} is completed`);
        const client = new Client("wss://s.devnet.rippletest.net:51233");

        const request: SubmitRequest = {
            command: "submit",
            tx_blob: proof.data.tx_blob,
            fail_hard: true,
        };

        await client.connect();
        const response = await client.request(request);

        this.logger.log(response.status, response.result.tx_json.hash);

        await client.disconnect();

        this.logger.log(`Submitting proof for message ${relayerRequest.messageId} on ${relayerRequest.destinationChain}`);
        await this.submitProofXrpl(response.result.tx_json.hash!);

        this.logger.log(`Updating transaction status for message ${relayerRequest.messageId} on ${relayerRequest.destinationChain}`);
        await this.updateTxStatusXrpl(
            multisigSessionId,
            response.result.tx_json.hash!,
            response.result.tx_json.Signers![0].Signer.SigningPubKey,
        );
    }

    /**
     * Relay the message from EVM to XRPL.
     * @param relayerRequest The relayer request.
     * @param txHash The transaction hash.
     */
    async relayEvmToXrpl(relayerRequest: RelayerEvmRequest, txHash: string): Promise<void> {
        if (this.externalRelayedChains.indexOf(relayerRequest.sourceChain) === -1) {
            await this.verifyMessages(relayerRequest, txHash);
        } else {
            await sleep(this.externalRelayWaitTime);
        }
        await sleep(this.verifyWaitTime);
        // relayerRequest = await this.itsRelayerService.executeItsHub(relayerRequest);

        await sleep(this.proveWaitTime);

        this.logger.log(`Getting message ID for message ${relayerRequest.messageId} on ${relayerRequest.destinationChain}`);

        const res = execSync(
            `axelard query txs --events "wasm-message_executed"."message_id"="${relayerRequest.messageId}" --node ${this.axelarRpc} --chain-id ${this.axelarChainId} --output json`,
        );

        const jsonResponse = JSON.parse(res.toString());

        const log = jsonResponse.txs[0].logs.find((log: any) => log.events.find((event: any) => event.type === "wasm-message_executed"));
        const messageId = log.events
            .find((event: any) => event.type === "wasm-message_routed")
            .attributes.find((attr: any) => attr.key === "message_id").value;

        const payload = log.events
            .find((event: any) => event.type === "wasm-contract_called")
            .attributes.find((attr: any) => attr.key === "payload").value;

        relayerRequest.messageId = messageId;
        relayerRequest.payload = payload;
        const multisigSessionId = await this.constructTransferProofXrpl(relayerRequest);
        await sleep(this.proveWaitTime * 3);
        await this.proveTransferXrpl(relayerRequest, multisigSessionId);
    }
}
