import { Module } from "@nestjs/common";
import { GmpRelayerService } from "./gmp-relayer.service";
import { ItsRelayerService } from "./its-relayer.service";
import { GatewayIndexerService } from "./indexers/gateway.indexer.service";

@Module({
    imports: [],
    providers: [GmpRelayerService, ItsRelayerService, GatewayIndexerService],
    controllers: [],
    exports: [],
})
export class RelayerModule {}
