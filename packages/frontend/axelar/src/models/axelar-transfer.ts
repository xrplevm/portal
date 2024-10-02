import { Transfer } from "@frontend/activity";
import { AxelarGMPTransferCallObject, AxelarGMPTransferConfirmObject, AxelarGMPTransferObject } from "../types";

export class AxelarTransfer {
    approved: AxelarGMPTransferCallObject;
    call: AxelarGMPTransferCallObject;
    commandId: string;
    confirm: AxelarGMPTransferConfirmObject;
    confirmFailed: boolean;
    // confirmFailedEvent: AxelarGMPTransferConfirmFailedEvent | null;
    executeNonce: unknown | null;
    executePendingTransactionHash: unknown | null;
    executed: AxelarGMPTransferCallObject;
    // fees: AxelarGMPTransferFees;
    // gas: AxelarGMPTransferGas;
    id: string;
    isCallFromRelayer: boolean;
    isExecuteFromRelayer: boolean;
    isInsufficientFee: boolean;
    isInvalidCall: boolean;
    isInvalidContractAddress: boolean;
    isInvalidDestinationAddress: boolean;
    isInvalidPayloadHash: boolean;
    isInvalidSourceAddress: boolean;
    isInvalidSymbol: boolean;
    isNotEnoughGas: boolean;
    isTwoWay: boolean;
    messageId: string;
    notEnoughGasToExecute: boolean;
    simplifiedStatus: string;
    status: string;
    // timeSpent: AxelarGMPTransferTimeSpent;
    toRefund: boolean;

    constructor(axelarTransfer: AxelarGMPTransferObject, _: string) {
        this.approved = axelarTransfer.approved;
        this.call = axelarTransfer.call;
        this.commandId = axelarTransfer.command_id;
        this.confirm = axelarTransfer.confirm;
        this.confirmFailed = axelarTransfer.confirm_failed;
        this.executeNonce = axelarTransfer.execute_nonce;
        this.executePendingTransactionHash = axelarTransfer.execute_pending_transaction_hash;
        this.executed = axelarTransfer.executed;
        this.id = axelarTransfer.id;
        this.isCallFromRelayer = axelarTransfer.is_call_from_relayer;
        this.isExecuteFromRelayer = axelarTransfer.is_execute_from_relayer;
        this.isInsufficientFee = axelarTransfer.is_insufficient_fee;
        this.isInvalidCall = axelarTransfer.is_invalid_call;
        this.isInvalidContractAddress = axelarTransfer.is_invalid_contract_address;
        this.isInvalidDestinationAddress = axelarTransfer.is_invalid_destination_address;
        this.isInvalidPayloadHash = axelarTransfer.is_invalid_payload_hash;
        this.isInvalidSourceAddress = axelarTransfer.is_invalid_source_address;
        this.isInvalidSymbol = axelarTransfer.is_invalid_symbol;
        this.isNotEnoughGas = axelarTransfer.is_not_enough_gas;
        this.isTwoWay = axelarTransfer.is_two_way;
        this.messageId = axelarTransfer.message_id;
        this.notEnoughGasToExecute = axelarTransfer.not_enough_gas_to_execute;
        this.simplifiedStatus = axelarTransfer.simplified_status;
        this.status = axelarTransfer.status;
        this.toRefund = axelarTransfer.to_refund;
    }

    /**
     * Converts the Axelar transfer to a transfer object.
     * @returns The transfer object.
     */
    toTransfer(): Transfer {
        return new Transfer({
            hash: this.id,
            sourceChainId: this.call.returnValues.sourceChain || "",
            destinationChainId: this.call.returnValues.destinationChain || "",
            from: this.call.returnValues.sourceAddress || "",
            to: this.call.returnValues.destinationAddress || "",
            // TODO: Add amount
            amount: "0",
            createdAt: this.call.block_timestamp,
        });
    }
}
