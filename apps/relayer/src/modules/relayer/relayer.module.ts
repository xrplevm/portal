import { Module } from "@nestjs/common";
import { GmpRelayerService } from "./gmp-relayer.service";
import { ItsRelayerService } from "./its-relayer.service";

@Module({
    imports: [],
    providers: [GmpRelayerService, ItsRelayerService],
    controllers: [],
    exports: [],
})
export class RelayerModule {}
