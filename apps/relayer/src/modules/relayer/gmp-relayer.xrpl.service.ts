import { Inject, Injectable, Logger } from "@nestjs/common";
import { execSync } from "child_process";
import axelarChains from "../../config/axelar-chains.json";
import { id } from "ethers/lib/utils";
import { RelayerXrplRequest } from "./requests/relayer-xrpl.request";
import { ConfigService } from "@nestjs/config";
import { ItsRelayerService } from "./its-relayer.service";
import { sleep } from "../common/utils/sleep";
import { Contract, Wallet } from "ethers";
import IAxelarExecutable from "@axelar-network/axelar-gmp-sdk-solidity/interfaces/IAxelarExecutable.json";
import { providers } from "ethers";

@Injectable()
export class GmpRelayerXrplService {
    private readonly axelarChainId: string;
    private readonly axelarRpc: string;
    private readonly verifyWaitTime: number;
    private readonly proveWaitTime: number;
    private readonly externalRelayWaitTime: number;
    private readonly privateKey: string;
    private readonly externalRelayedChains: string[];
    private readonly itsGasLimit: number;
    private readonly logger: Logger;
    constructor(
        @Inject(ConfigService) private readonly configService: ConfigService,
        private readonly itsRelayerService: ItsRelayerService,
    ) {
        this.logger = new Logger(GmpRelayerXrplService.name);
        this.axelarChainId = this.configService.get<string>("axelar.chainId")!;
        this.axelarRpc = this.configService.get<string>("axelar.rpcUrl")!;
        this.verifyWaitTime = this.configService.get<number>("axelar.verifyWaitTime")!;
        this.proveWaitTime = this.configService.get<number>("axelar.proveWaitTime")!;
        this.externalRelayWaitTime = this.configService.get<number>("axelar.externalRelayWaitTime")!;
        this.privateKey = this.configService.get<string>("axelar.privateKey")!;
        this.externalRelayedChains = this.configService.get<string[]>("axelar.externalRelayedChains")!;
        this.itsGasLimit = this.configService.get<number>("axelar.itsGasLimit")!;
    }

    /**
     * Sign and submit the transaction.
     * @param chain The chain.
     * @param transaction The transaction.
     */
    async signAndSubmitTransaction(chain: string, transaction: { to: string; data: string }): Promise<void> {
        this.logger.log(`Relaying transaction to ${chain}`);
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
    async verifyXrplMessages(relayerRequest: RelayerXrplRequest): Promise<void> {
        this.logger.log(`Verifying message ${relayerRequest.userRequest.txId} on XRPL`);

        //@ts-ignore
        const sourceChainGateway = axelarChains.axelar.contracts.Gateway[relayerRequest.sourceChain].address;

        const userMessage = {
            tx_id: Array.from(new Uint8Array(Buffer.from(relayerRequest.userRequest.txId, "hex"))),
            source_address: Array.from(new Uint8Array(Buffer.from(relayerRequest.userRequest.sourceAddress, "hex"))),
            destination_chain: relayerRequest.userRequest.destinationChain,
            destination_address: relayerRequest.userRequest.destinationAddress,
            amount: { drops: Number(relayerRequest.userRequest.amount) },
            payload_hash: relayerRequest.userRequest.payloadHash,
        };

        const contractCall = {
            verify_messages: [{ user_message: userMessage }],
        };

        execSync(`axelard tx wasm execute ${sourceChainGateway} '${JSON.stringify(contractCall)}' ${this.axelarCmdTransactionFlags()}`, {
            stdio: "inherit",
        });

        await new Promise((resolve) => setTimeout(resolve, this.verifyWaitTime));

        const routeMessageCall = {
            route_incoming_messages: [
                {
                    payload: relayerRequest.userRequest.payload,
                    message: {
                        user_message: userMessage,
                    },
                },
            ],
        };

        this.logger.log(`Routing incoming message ${relayerRequest.userRequest.txId} on ${relayerRequest.userRequest.destinationChain}`);
        execSync(
            `axelard tx wasm execute ${sourceChainGateway} '${JSON.stringify(routeMessageCall)}' ${this.axelarCmdTransactionFlags()}`,
            {
                stdio: "inherit",
            },
        );
    }

    /**
     * Route the messages.
     * @param relayerRequest The relayer request.
     */
    async routeMessagesXrpl(relayerRequest: RelayerXrplRequest): Promise<void> {
        //@ts-ignore
        const sourceChainGateway = axelarChains.axelar.contracts.AxelarnetGateway.address;
        this.logger.log(`Routing message ${relayerRequest.userRequest.txId} on ${relayerRequest.userRequest.destinationChain}`);
        // 01. Route the message
        const routeMessageCall = {
            route_messages: [
                {
                    cc_id: {
                        source_chain: relayerRequest.sourceChain,
                        message_id: relayerRequest.userRequest.txId,
                    },
                    destination_chain: axelarChains.axelar.id,
                    destination_address: axelarChains.axelar.contracts.InterchainTokenService.address,
                    source_address: axelarChains.chains.xrpl.contracts.AxelarGateway.address,
                    payload_hash: relayerRequest.userRequest.payloadHash,
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
    async constructTransferProofXrpl(relayerRequest: RelayerXrplRequest): Promise<string> {
        this.logger.log(
            `Constructing proof for message ${relayerRequest.userRequest.txId} on ${relayerRequest.userRequest.destinationChain}`,
        );
        // 02. Construct proof
        // @ts-ignore
        const destinationChainMultisigProver = axelarChains.axelar.contracts.MultisigProver["xrpl-evm-sidechain"].address;
        const constructProofCall = {
            construct_proof: [
                {
                    source_chain: axelarChains.axelar.id,
                    message_id: relayerRequest.userRequest.txId,
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
     * Resolve the message ID for an XRP message.
     * @param relayerRequest The relayer request.
     * @returns The execute data.
     */
    async resolveXrplTransaction(
        relayerRequest: RelayerXrplRequest,
    ): Promise<{ relayerRequest: RelayerXrplRequest; multisigSessionId: string }> {
        if (this.externalRelayedChains.indexOf(relayerRequest.sourceChain) === -1) {
            await this.verifyXrplMessages(relayerRequest);
        } else {
            await sleep(this.externalRelayWaitTime);
        }
        await sleep(this.verifyWaitTime);
        relayerRequest = await this.itsRelayerService.executeItsHubXrpl(relayerRequest);
        await this.routeMessagesXrpl(relayerRequest);
        const multisigSessionId = await this.constructTransferProofXrpl(relayerRequest);
        await sleep(this.proveWaitTime);

        return { relayerRequest, multisigSessionId };
    }

    /**
     * Prepare the relay transfer transaction.
     * @param relayerRequest The relayer request.
     * @param multisigSessionId The multisig session ID.
     * @returns The transaction.
     */
    async prepareRelayTransferTransactionXrpl(
        relayerRequest: RelayerXrplRequest,
        multisigSessionId: string,
    ): Promise<{ to: string; data: string }> {
        const destinationChainMultisigProver =
            //@ts-ignore
            axelarChains.axelar.contracts.MultisigProver[relayerRequest.userRequest.destinationChain].address;

        this.logger.log(
            `Getting proof for message ${relayerRequest.userRequest.txId} on ${relayerRequest.userRequest.destinationChain} with multisig session id ${multisigSessionId}`,
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
        const gatewayAddress = axelarChains.chains[relayerRequest.userRequest.destinationChain].contracts.AxelarGateway.address;
        return {
            to: gatewayAddress,
            data: `0x${proof.data.status.completed.execute_data}`,
        };
    }

    /**
     * Prepare the execute ITS transfer.
     * @param relayerRequest The relayer request.
     */
    async prepareExecuteItsTransferFromXrpl(relayerRequest: RelayerXrplRequest): Promise<void> {
        this.logger.log(
            `Executing ITS transfer for message ${relayerRequest.userRequest.txId} on ${relayerRequest.userRequest.destinationChain}`,
        );
        const commandId = id(`${axelarChains.axelar.id}_${relayerRequest.userRequest.txId}`);
        // @ts-ignore
        const destinationIts = axelarChains.chains[relayerRequest.userRequest.destinationChain].contracts.InterchainTokenService.address;
        // @ts-ignore
        const provider = new providers.JsonRpcProvider(axelarChains.chains[relayerRequest.userRequest.destinationChain].rpc);
        const wallet = new Wallet(this.privateKey, provider);
        const appContract = new Contract(destinationIts, IAxelarExecutable.abi, wallet);

        const tx = await appContract.execute(
            commandId,
            axelarChains.axelar.id,
            relayerRequest.userRequest.sourceAddress,
            `0x${relayerRequest.userRequest.payload}`,
            {
                gasLimit: this.itsGasLimit,
            },
        );
        await tx.wait();
        this.logger.log(
            `Transaction completed for message ${relayerRequest.userRequest.txId} on ${relayerRequest.userRequest.destinationChain}`,
        );
    }

    /**
     * Relay the transaction to EVM from XRP.
     * @param relayerRequest The relayer request.
     * @param multisigSessionId The multisig session ID.
     */
    async relayTransactionToEvmFromXrpl(relayerRequest: RelayerXrplRequest, multisigSessionId: string): Promise<void> {
        this.logger.log(`Relaying message ${relayerRequest.userRequest.txId} on ${relayerRequest.userRequest.destinationChain}`);
        const relayTransferTransaction = await this.prepareRelayTransferTransactionXrpl(relayerRequest, multisigSessionId);
        await this.signAndSubmitTransaction(relayerRequest.userRequest.destinationChain, relayTransferTransaction);
        await this.prepareExecuteItsTransferFromXrpl(relayerRequest);
    }

    /**
     * Relay the request.
     * @param relayerRequest The relayer request.
     */
    async relayXrplToEvm(relayerRequest: RelayerXrplRequest): Promise<void> {
        this.logger.log(`Relaying message ${relayerRequest.userRequest.txId} on ${relayerRequest.userRequest.destinationChain}`);

        const { relayerRequest: resolved, multisigSessionId } = await this.resolveXrplTransaction(relayerRequest);
        await this.relayTransactionToEvmFromXrpl(resolved, multisigSessionId);
    }
}
