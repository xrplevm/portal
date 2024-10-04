import { mockify } from "@shared/test";
import { AxelarGMPReturnValuesObject } from "../../../src";

export const AxelarGMPReturnValuesObjectMock = mockify<AxelarGMPReturnValuesObject>({
    commandId: "0xabcdef1234567890",
    contractAddress: "0x9876543210fedcba",
    destinationAddress: "0xfedcba9876543210",
    messageID: "msg123456",
    messageId: "msg123456",
    payloadHash: "0x0123456789abcdef",
    sourceChain: "xrpl",
    destinationChain: "xrpl-evm",
});
