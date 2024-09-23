import { Module } from "@nestjs/common";
import { RelayerService } from "./relayer.service";
import { RelayerController } from "./relayer.controller";

@Module({
    imports: [],
    providers: [RelayerService],
    controllers: [RelayerController],
    exports: [],
})
export class RelayerModule {}
