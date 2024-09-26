import { Inject, Injectable, Logger } from "@nestjs/common";
import { RelayerEvmRequest } from "./requests/relayer-evm.request";
import { ConfigService } from "@nestjs/config";
import { execSync } from "child_process";
import axelarChains from "../../config/axelar-chains.json";
import { Contract, providers, Wallet } from "ethers";
import { id } from "ethers/lib/utils";
import IAxelarExecutable from "@axelar-network/axelar-gmp-sdk-solidity/interfaces/IAxelarExecutable.json";
import { sleep } from "../common/utils/sleep";
import { ItsRelayerService } from "./its-relayer.service";

@Injectable()
export class GmpRelayerService {
    private readonly axelarChainId: string;
    private readonly axelarRpc: string;
    private readonly verifyWaitTime: number;
    private readonly proveWaitTime: number;
    private readonly externalRelayWaitTime: number;
    private readonly privateKey: string;
    private readonly externalRelayedChains: string[];

    constructor(
        @Inject(ConfigService) private readonly configService: ConfigService,
        private readonly itsRelayerService: ItsRelayerService,
    ) {
        this.axelarChainId = this.configService.get<string>("axelar.chainId")!;
        this.axelarRpc = this.configService.get<string>("axelar.rpcUrl")!;
        this.verifyWaitTime = this.configService.get<number>("axelar.verifyWaitTime")!;
        this.proveWaitTime = this.configService.get<number>("axelar.proveWaitTime")!;
        this.externalRelayWaitTime = this.configService.get<number>("axelar.externalRelayWaitTime")!;
        this.privateKey = this.configService.get<string>("axelar.privateKey")!;
        this.externalRelayedChains = this.configService.get<string[]>("axelar.externalRelayedChains")!;
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
     */
    async verifyMessages(relayerRequest: RelayerEvmRequest): Promise<void> {
        //@ts-ignore
        const sourceChainGateway = axelarChains.axelar.contracts.Gateway[relayerRequest.sourceChain].address;

        // 00. Verify the message
        Logger.log(`Verifying message ${relayerRequest.messageId} on ${relayerRequest.sourceChain}`);
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

        Logger.log(`Routing message ${relayerRequest.messageId} on ${relayerRequest.destinationChain}`);
        // 01. Route the message
        const routeMessageCall = {
            route_messages: [
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
    async constructTransferProof(relayerRequest: RelayerEvmRequest): Promise<string> {
        Logger.log(`Constructing proof for message ${relayerRequest.messageId} on ${relayerRequest.destinationChain}`);
        // 02. Construct proof
        // @ts-ignore
        const destinationChainMultisigProver = axelarChains.axelar.contracts.MultisigProver[relayerRequest.destinationChain].address;
        const constructProofCall = {
            construct_proof: [
                {
                    source_chain: relayerRequest.sourceChain,
                    message_id: relayerRequest.messageId,
                },
            ],
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
     * Prepare the relay transfer transaction.
     * @param relayerRequest The relayer request.
     * @param multisigSessionId The multisig session ID.
     * @returns The transaction.
     */
    async prepareRelayTransferTransaction(
        relayerRequest: RelayerEvmRequest,
        multisigSessionId: string,
    ): Promise<{ to: string; data: string }> {
        //@ts-ignore
        const destinationChainMultisigProver = axelarChains.axelar.contracts.MultisigProver[relayerRequest.destinationChain].address;

        Logger.log(
            `Getting proof for message ${relayerRequest.messageId} on ${relayerRequest.destinationChain} with multisig session id ${multisigSessionId}`,
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
        //@ts-ignore
        const gatewayAddress = axelarChains.chains[relayerRequest.destinationChain].contracts.AxelarGateway.address;
        return {
            to: gatewayAddress,
            data: `0x${proof.data.status.completed.execute_data}`,
        };
    }

    /**
     * Prepare the execute ITS transfer.
     * @param relayerRequest The relayer request.
     */
    async prepareExecuteItsTransfer(relayerRequest: RelayerEvmRequest): Promise<void> {
        Logger.log(`Executing ITS transfer for message ${relayerRequest.messageId} on ${relayerRequest.destinationChain}`);
        const commandId = id(`${relayerRequest.sourceChain}_${relayerRequest.messageId}`);
        // @ts-ignore
        const destinationIts = axelarChains.chains[relayerRequest.destinationChain].contracts.InterchainTokenService.address;
        // @ts-ignore
        const provider = new providers.JsonRpcProvider(axelarChains.chains[relayerRequest.destinationChain].rpc);
        const wallet = new Wallet(this.privateKey, provider);
        const appContract = new Contract(destinationIts, IAxelarExecutable.abi, wallet);
        const tx = await appContract.execute(
            commandId,
            relayerRequest.sourceChain,
            relayerRequest.sourceAddress,
            `0x${relayerRequest.payload}`,
            {
                gasLimit: 1000000,
            },
        );
        await tx.wait();
    }

    /**
     * Sign and submit the transaction.
     * @param chain The chain.
     * @param transaction The transaction.
     */
    async signAndSubmitTransaction(chain: string, transaction: { to: string; data: string }): Promise<void> {
        Logger.log(`Relaying transaction to ${chain}`);
        // @ts-ignore
        const provider = new providers.JsonRpcProvider(axelarChains.chains[chain].rpc);
        const wallet = new Wallet(this.privateKey, provider);
        const tx = await wallet.sendTransaction({
            from: wallet.address,
            to: transaction.to,
            data: transaction.data,
            value: "0",
        });
        await tx.wait();
    }

    /**
     * Resolve the message ID for an EVM message.
     * @param relayerRequest The relayer request.
     * @returns The execute data.
     */
    async resolveEvmTransaction(
        relayerRequest: RelayerEvmRequest,
    ): Promise<{ relayerRequest: RelayerEvmRequest; multisigSessionId: string }> {
        if (this.externalRelayedChains.indexOf(relayerRequest.sourceChain) === -1) {
            await this.verifyMessages(relayerRequest);
        } else {
            await sleep(this.externalRelayWaitTime);
        }
        await sleep(this.verifyWaitTime);
        if (relayerRequest.destinationChain === "axelarnet") {
            relayerRequest = await this.itsRelayerService.executeItsHub(relayerRequest);
        }
        const multisigSessionId = await this.constructTransferProof(relayerRequest);
        await sleep(this.proveWaitTime);

        return { relayerRequest, multisigSessionId };
    }

    /**
     * Relay the request.
     * @param relayerRequest The relayer request.
     * @param multisigSessionId The multisig session ID.
     */
    async relayTransactionToEvm(relayerRequest: RelayerEvmRequest, multisigSessionId: string): Promise<void> {
        Logger.log(`Relaying message ${relayerRequest.messageId} on ${relayerRequest.destinationChain}`);
        const relayTransferTransaction = await this.prepareRelayTransferTransaction(relayerRequest, multisigSessionId);
        await this.signAndSubmitTransaction(relayerRequest.destinationChain, relayTransferTransaction);
        await this.prepareExecuteItsTransfer(relayerRequest);
    }

    /**
     * Relay the request.
     * @param relayerRequest The relayer request.
     */
    async relayEvmToEvm(relayerRequest: RelayerEvmRequest): Promise<void> {
        const { relayerRequest: resolved, multisigSessionId } = await this.resolveEvmTransaction(relayerRequest);
        await this.relayTransactionToEvm(resolved, multisigSessionId);
    }
}
