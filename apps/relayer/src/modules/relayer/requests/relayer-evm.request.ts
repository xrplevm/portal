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
    txHash: string;

    @ApiProperty({
        type: "string",
        required: true,
    })
    txEvent: string;

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
