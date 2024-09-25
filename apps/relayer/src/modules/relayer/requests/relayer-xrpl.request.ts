import { ApiProperty } from "@nestjs/swagger";

export class XrplUserRequest {
    @ApiProperty({
        type: "string",
        required: true,
        name: "tx_id",
    })
    txId: string;

    @ApiProperty({
        type: "string",
        required: true,
    })
    sourceAddress: string;

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

    @ApiProperty({
        type: "string",
        required: true,
        name: "amount",
        description: "The amount to be relayed (in drops)",
    })
    amount: string;

    @ApiProperty({
        type: "string",
        required: true,
    })
    payloadHash: string;
}

export class RelayerXrplRequest {
    @ApiProperty({
        required: true,
        name: "user_request",
    })
    userRequest: XrplUserRequest;

    @ApiProperty({
        type: "string",
        required: true,
    })
    sourceChain: string;
}
