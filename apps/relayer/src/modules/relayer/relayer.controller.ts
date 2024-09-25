import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { RelayerEvmRequest } from "./requests/relayer-evm.request";
import { RelayerService } from "./relayer.service";
import { ApiErrorDecorators } from "../common/exception/error-response.decorator";
import { RelayerXrplRequest } from "./requests/relayer-xrpl.request";

@ApiTags("relayer")
@Controller("relayer")
@ApiErrorDecorators()
export class RelayerController {
    constructor(private readonly relayerService: RelayerService) {}

    @Post("relay/evm-evm")
    @ApiOperation({ summary: "Relay a message from EVM chains" })
    async relayEvmToEvm(@Body() relayRequest: RelayerEvmRequest): Promise<void> {
        return await this.relayerService.relayEvmToEvm(relayRequest);
    }

    @Post("relay/xrpl-evm")
    @ApiOperation({ summary: "Relay a message from XRPL chains" })
    async relayXrplToEvm(@Body() relayRequest: RelayerXrplRequest): Promise<void> {
        return await this.relayerService.relayXrplToEvm(relayRequest);
    }

    @Post("relay/evm-xrpl")
    @ApiOperation({ summary: "Relay a message from EVM chains" })
    async relayEvmToXrpl(@Body() relayRequest: RelayerEvmRequest): Promise<void> {
        return await this.relayerService.relayEvmToXrpl(relayRequest);
    }
}
