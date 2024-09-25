import { Module } from "@nestjs/common";
import { RelayerService } from "./relayer.service";
import { RelayerController } from "./relayer.controller";
import { GatewayIndexerService } from "./indexers/gateway.indexer.service";

@Module({
    imports: [],
    providers: [RelayerService, GatewayIndexerService],
    controllers: [RelayerController],
    exports: [],
})
export class RelayerModule {}
