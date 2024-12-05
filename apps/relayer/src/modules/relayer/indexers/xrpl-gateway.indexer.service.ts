import { Inject, Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { GmpRelayerXrplService } from "../gmp-relayer.xrpl.service";
import { XrplLedgersIndexer } from "@bloxer/xrpl-ledgers";
import { ConfigService } from "@nestjs/config";
import axelarChains from "../../../config/axelar-chains.json";
import { xrplAccountToEvmAddress } from "../../../utils/address-translation";
import { Ledger } from "xrpl/dist/npm/models/ledger";

@Injectable()
export class XrplGatewayIndexerService implements OnApplicationBootstrap {
    constructor(
        @Inject(ConfigService) private readonly configService: ConfigService,
        private readonly gmpRelayerXrplService: GmpRelayerXrplService,
    ) {}

    /**
     * On application bootstrap, we want to start the indexer.
     */
    async onApplicationBootstrap() {
        const axelarGatewayAddress = axelarChains.chains["xrpl"].contracts.AxelarGateway.address;
        const gatewayIndexer = new XrplLedgersIndexer({
            wsUrl: this.configService.get("axelar.chainWebsockets")["xrpl"],
            persistState: false,
            requestOptions: {
                transactions: true,
                expand: true,
            },
            logger: {
                minLevel: 4,
                name: "xrpl-gateway-indexer",
            },
            startingBlock: "latest",
        });

        gatewayIndexer.on("Ledger", async (ledger: Ledger) => {
            for (const transaction of ledger.transactions || []) {
                if (transaction.TransactionType === "Payment" && transaction.Destination === axelarGatewayAddress) {
                    const memos = transaction.Memos?.reduce(
                        (acc, memo) => {
                            const key = Buffer.from(memo!.Memo!.MemoType!, "hex").toString("utf-8");
                            acc[key || "test"] = memo.Memo.MemoData;
                            return acc;
                        },
                        {} as Record<string, string | undefined>,
                    );

                    await this.gmpRelayerXrplService.relayXrplToEvm({
                        sourceChain: "xrpl",
                        userRequest: {
                            destinationChain: Buffer.from(memos!["destination_chain"]!, "hex").toString("utf-8"),
                            destinationAddress: Buffer.from(memos!["destination_address"]!, "hex").toString("hex"),
                            amount: transaction.Amount.toString(),
                            payload: "",
                            payloadHash: memos!["payload_hash"]!,
                            txId: transaction.hash!,
                            sourceAddress: xrplAccountToEvmAddress(transaction.Account).slice(2),
                        },
                    });
                }
            }
        });

        gatewayIndexer.run();
    }
}
