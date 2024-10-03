import { Chain } from "@frontend/chain";

export type TransferObject = {
    hash: string;
    sourceChainId: string;
    destinationChainId: string;
    from: string;
    to: string;
    amount: string;
    symbol: string;
    decimals: number;
    createdAt: number;
};

export class Transfer {
    hash: string;
    sourceChainId: string;
    destinationChainId: string;
    from: string;
    to: string;
    amount: string;
    symbol: string;
    decimals: number;
    createdAt: number;
    sourceChain?: Chain;
    destinationChain?: Chain;

    constructor(transferObject: TransferObject) {
        this.hash = transferObject.hash;
        this.sourceChainId = transferObject.sourceChainId;
        this.destinationChainId = transferObject.destinationChainId;
        this.from = transferObject.from;
        this.to = transferObject.to;
        this.amount = transferObject.amount;
        this.symbol = transferObject.symbol;
        this.decimals = transferObject.decimals;
        this.createdAt = transferObject.createdAt;
    }
}
