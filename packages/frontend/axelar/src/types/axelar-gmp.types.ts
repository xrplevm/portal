export type AxelarGMPTransferCallObject = {
    block_timestamp: number;
    chain: string;
    chain_type: string;
    event: string;
    event_index: number;
    id: string;
    // receipt: AxelarGMPTransferReceipt;
    returnValues: AxelarGMPReturnValuesObject;
    // transaction: AxelarGMPTransferTransaction;
    transactionHash: string;
    _id: string;
    _logIndex: number;
};

export type AxelarGMPReturnValuesObject = {
    commandId: string;
    contractAddress: string;
    destinationAddress: string;
    messageID: string;
    messageId: string;
    payloadHash: string;
    sourceAddress?: string;
    sourceChain: string;
    sourceEventIndex: string;
    sourceTxHash: string;
    destinationContractAddress?: string;
    destinationChain?: string;
    sender?: string;
};

export type AxelarGMPTransferConfirmObject = {
    blockNumber: number;
    block_timestamp: number;
    confirmation_txhash: string;
    contract_address: string;
    event: string;
    poll_id: string;
    sourceChain: string;
    sourceTransactionHash: string;
    transactionHash: string;
    transactionIndex: number;
};

export type AxelarGMPTransferObject = {
    approved: AxelarGMPTransferCallObject;
    call: AxelarGMPTransferCallObject;
    command_id: string;
    confirm: AxelarGMPTransferConfirmObject;
    confirm_failed: boolean;
    // confirm_failed_event: AxelarGMPTransferConfirmFailedEvent | null;
    execute_nonce: unknown | null;
    execute_pending_transaction_hash: unknown | null;
    executed: AxelarGMPTransferCallObject;
    // fees: AxelarGMPTransferFees;
    // gas: AxelarGMPTransferGas;
    id: string;
    is_call_from_relayer: boolean;
    is_execute_from_relayer: boolean;
    is_insufficient_fee: boolean;
    is_invalid_call: boolean;
    is_invalid_contract_address: boolean;
    is_invalid_destination_address: boolean;
    is_invalid_payload_hash: boolean;
    is_invalid_source_address: boolean;
    is_invalid_symbol: boolean;
    is_not_enough_gas: boolean;
    is_two_way: boolean;
    message_id: string;
    not_enough_gas_to_execute: boolean;
    simplified_status: string;
    status: string;
    // time_spent: AxelarGMPTransferTimeSpent;
    to_refund: boolean;
};

export type AxelarGMPTransfersObject = {
    data: AxelarGMPTransferObject[];
    total: number;
    time_spent: number;
    from: number;
    pageSize: number;
};

export enum AxelarGMPTransferContractMethod {
    INTERCHAIN_TRANSFER = "InterchainTransfer",
}
