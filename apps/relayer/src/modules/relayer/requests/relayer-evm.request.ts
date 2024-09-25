import { ApiProperty } from "@nestjs/swagger";

export class RelayerEvmRequest {
    @ApiProperty({
        type: "string",
        required: true,
    })
    sourceChain: string;

    @ApiProperty({
        type: "string",
        required: true,
    })
    sourceAddress: string;

    @ApiProperty({
        type: "string",
        required: true,
    })
    messageId: string;

    @ApiProperty({
        type: "string",
        required: true,
    })
    payload: string;

    @ApiProperty({
        type: "string",
        required: true,
    })
    payloadHash: string;

    @ApiProperty({
        type: "string",
        required: true,
    })
    destinationChain: string;

    @ApiProperty({
        type: "string",
        required: true,
    })
    destinationAddress: string;
}
