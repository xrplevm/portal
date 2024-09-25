import { Contract, ethers } from "ethers";

type AxelarAmplifierGatewayProxyContract = Contract;

const axelarAmplifierGatewayProxyAbi = [
    {
        inputs: [],
        name: "InvalidMessages",
        type: "error",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address",
            },
            {
                indexed: false,
                internalType: "string",
                name: "destinationChain",
                type: "string",
            },
            {
                indexed: false,
                internalType: "string",
                name: "destinationContractAddress",
                type: "string",
            },
            {
                indexed: true,
                internalType: "bytes32",
                name: "payloadHash",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "bytes",
                name: "payload",
                type: "bytes",
            },
        ],
        name: "ContractCall",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "commandId",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "string",
                name: "sourceChain",
                type: "string",
            },
            {
                indexed: false,
                internalType: "string",
                name: "messageId",
                type: "string",
            },
            {
                indexed: false,
                internalType: "string",
                name: "sourceAddress",
                type: "string",
            },
            {
                indexed: true,
                internalType: "address",
                name: "contractAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "bytes32",
                name: "payloadHash",
                type: "bytes32",
            },
        ],
        name: "MessageApproved",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "commandId",
                type: "bytes32",
            },
        ],
        name: "MessageExecuted",
        type: "event",
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "destinationChain",
                type: "string",
            },
            {
                internalType: "string",
                name: "destinationContractAddress",
                type: "string",
            },
            {
                internalType: "bytes",
                name: "payload",
                type: "bytes",
            },
        ],
        name: "callContract",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "commandId",
                type: "bytes32",
            },
        ],
        name: "isCommandExecuted",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "commandId",
                type: "bytes32",
            },
            {
                internalType: "string",
                name: "sourceChain",
                type: "string",
            },
            {
                internalType: "string",
                name: "sourceAddress",
                type: "string",
            },
            {
                internalType: "address",
                name: "contractAddress",
                type: "address",
            },
            {
                internalType: "bytes32",
                name: "payloadHash",
                type: "bytes32",
            },
        ],
        name: "isContractCallApproved",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "sourceChain",
                type: "string",
            },
            {
                internalType: "string",
                name: "messageId",
                type: "string",
            },
            {
                internalType: "string",
                name: "sourceAddress",
                type: "string",
            },
            {
                internalType: "address",
                name: "contractAddress",
                type: "address",
            },
            {
                internalType: "bytes32",
                name: "payloadHash",
                type: "bytes32",
            },
        ],
        name: "isMessageApproved",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "sourceChain",
                type: "string",
            },
            {
                internalType: "string",
                name: "messageId",
                type: "string",
            },
        ],
        name: "isMessageExecuted",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "sourceChain",
                type: "string",
            },
            {
                internalType: "string",
                name: "messageId",
                type: "string",
            },
        ],
        name: "messageToCommandId",
        outputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32",
            },
        ],
        stateMutability: "pure",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "commandId",
                type: "bytes32",
            },
            {
                internalType: "string",
                name: "sourceChain",
                type: "string",
            },
            {
                internalType: "string",
                name: "sourceAddress",
                type: "string",
            },
            {
                internalType: "bytes32",
                name: "payloadHash",
                type: "bytes32",
            },
        ],
        name: "validateContractCall",
        outputs: [
            {
                internalType: "bool",
                name: "valid",
                type: "bool",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "sourceChain",
                type: "string",
            },
            {
                internalType: "string",
                name: "messageId",
                type: "string",
            },
            {
                internalType: "string",
                name: "sourceAddress",
                type: "string",
            },
            {
                internalType: "bytes32",
                name: "payloadHash",
                type: "bytes32",
            },
        ],
        name: "validateMessage",
        outputs: [
            {
                internalType: "bool",
                name: "valid",
                type: "bool",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
];

export class AxelarAmplifierGatewayProxyContractFactory {
    /**
     * Connect to the Axelar Amplifier Gateway Proxy contract.
     * @param address The address of the Axelar Amplifier Gateway Proxy contract.
     * @param provider The ethers.js provider.
     * @returns The Axelar Amplifier Gateway Proxy contract.
     */
    static connect(address: string, provider: ethers.providers.Provider): AxelarAmplifierGatewayProxyContract {
        return new ethers.Contract(address, axelarAmplifierGatewayProxyAbi, provider);
    }
}
