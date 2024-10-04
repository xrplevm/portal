import { Chain, ChainObject } from "@frontend/chain";

export type TransferObject = {
    hash: string;
    from: string;
    to: string;
    amount: string;
    symbol: string;
    decimals: number;
    createdAt: number;
    sourceChain: ChainObject;
    destinationChain: ChainObject;
};

export class Transfer {
    hash: string;
    from: string;
    to: string;
    amount: string;
    symbol: string;
    decimals: number;
    createdAt: number;
    sourceChain: Chain;
    destinationChain: Chain;

    constructor(transferObject: TransferObject) {
        this.hash = transferObject.hash;
        this.from = transferObject.from;
        this.to = transferObject.to;
        this.amount = transferObject.amount;
        this.symbol = transferObject.symbol;
        this.decimals = transferObject.decimals;
        this.createdAt = transferObject.createdAt;
        this.sourceChain = new Chain(transferObject.sourceChain);
        this.destinationChain = new Chain(transferObject.destinationChain);
    }
}
