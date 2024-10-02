import { Chain } from "@frontend/chain";

export type TransferObject = {
    hash: string;
    sourceChainId: string;
    destinationChainId: string;
    from: string;
    to: string;
    amount: string;
    createdAt: number;
};

export class Transfer {
    hash: string;
    sourceChainId: string;
    destinationChainId: string;
    from: string;
    to: string;
    amount: string;
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
        this.createdAt = transferObject.createdAt;
    }
}
