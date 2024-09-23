import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { RelayerRequest } from "./relayer.request";
import { RelayerService } from "./relayer.service";
import { ApiErrorDecorators } from "../common/exception/error-response.decorator";

@ApiTags("relayer")
@Controller("relayer")
@ApiErrorDecorators()
export class RelayerController {
    constructor(private readonly relayerService: RelayerService) {}

    @Post()
    @ApiOperation({ summary: "Relay message" })
    async relay(@Body() relayRequest: RelayerRequest): Promise<void> {
        return this.relayerService.relay(relayRequest);
    }
}
