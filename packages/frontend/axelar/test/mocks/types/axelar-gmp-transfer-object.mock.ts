import { mockify } from "@shared/test";
import { AxelarGMPTransferObject } from "../../../src";
import { AxelarGMPTransferCallObjectMock } from "./axelar-gmp-transfer-call-object.mock";
import { AxelarGMPTransferConfirmObjectMock } from "./axelar-gmp-transfer-confirm-object.mock";

export const AxelarGMPTransferObjectMock = mockify<AxelarGMPTransferObject>({
    approved: new AxelarGMPTransferCallObjectMock(),
    call: new AxelarGMPTransferCallObjectMock(),
    command_id: "0x1234567890abcdef",
    confirm: new AxelarGMPTransferConfirmObjectMock(),
    confirm_failed: false,
    // confirm_failed_event: AxelarGMPTransferConfirmFailedEvent | null;
    execute_nonce: 42,
    execute_pending_transaction_hash: "0xfedcba9876543210",
    executed: new AxelarGMPTransferCallObjectMock(),
    // fees: AxelarGMPTransferFees;
    // gas: AxelarGMPTransferGas;
    id: "transfer_123456",
    is_call_from_relayer: true,
    is_execute_from_relayer: false,
    is_insufficient_fee: false,
    is_invalid_call: false,
    is_invalid_contract_address: false,
    is_invalid_destination_address: false,
    is_invalid_payload_hash: false,
    is_invalid_source_address: false,
    is_invalid_symbol: false,
    is_not_enough_gas: true,
    is_two_way: true,
    message_id: "msg_789012",
    not_enough_gas_to_execute: false,
    simplified_status: "Completed",
    status: "Executed",
    // time_spent: AxelarGMPTransferTimeSpent;
    to_refund: false,
});
