import { Module } from "@nestjs/common";
import { GmpRelayerEvmService } from "./gmp-relayer.evm.service";
import { ItsRelayerService } from "./its-relayer.service";
import { GatewayIndexerService } from "./indexers/evm-gateway.indexer.service";
import { GmpRelayerXrplService } from "./gmp-relayer.xrpl.service";
import { XrplGatewayIndexerService } from "./indexers/xrpl-gateway.indexer.service";

@Module({
    providers: [GmpRelayerEvmService, GmpRelayerXrplService, ItsRelayerService, GatewayIndexerService, XrplGatewayIndexerService],
})
export class RelayerModule {}
