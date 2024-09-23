import { Inject, Injectable, Logger } from "@nestjs/common";
import { RelayerRequest } from "./relayer.request";
import { ConfigService } from "@nestjs/config";
import { execSync } from "child_process";
import axelarChains from "../../config/axelar-chains.json";
import { ethers, providers, Wallet } from "ethers";

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
     * Axelar command transaction flags.
     * @returns The transaction flags.
     */
    axelarCmdTransactionFlags(): string {
        return `--keyring-backend test --from wallet --gas 20000000 --gas-adjustment 1.5 --gas-prices 0.00005uamplifier --chain-id ${this.axelarChainId} --node ${this.axelarRpc}`;
    }

    /**
     * Relay the request.
     * @param relayerRequest The relayer request.
     */
    async relay(relayerRequest: RelayerRequest): Promise<void> {
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
        const executeData = proof.data.status.completed.execute_data;
        // @ts-ignore
        const destinationRpc = axelarChains.chains[relayerRequest.destinationChain].rpc;
        const provider = new providers.JsonRpcProvider(destinationRpc);
        const wallet = new Wallet(this.privateKey, provider);
        // @ts-ignore
        const gatewayAddress = axelarChains.chains[relayerRequest.destinationChain].contracts.AxelarGateway.address;
        Logger.log(`Sending proof for message ${messageId} on ${relayerRequest.destinationChain} with execute data ${executeData}`);
        await wallet
            .sendTransaction({ to: gatewayAddress, data: "0x" + executeData, gasLimit: ethers.BigNumber.from(120_000) })
            .then((tx) => tx.wait());
    }
}
