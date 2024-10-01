export type ExplorerPathsObject = {
    address: string;
    block: string;
    token: string;
    transaction: string;
};

export type ExplorerObject = {
    name: string;
    url: string;
    paths: ExplorerPathsObject;
    image?: string;
};

export class Explorer {
    name: string;
    url: string;
    paths: ExplorerPathsObject;
    image?: string;

    constructor(explorer: ExplorerObject) {
        this.name = explorer.name;
        this.url = explorer.url;
        this.paths = explorer.paths;
        this.image = explorer.image;
    }

    /**
     * Get the explorer's address url.
     * @param address The address to get the url for.
     * @returns The url for the address.
     */
    getAddressUrl(address: string): string {
        return this.url + this.paths.address.replace("{address}", address);
    }

    /**
     * Get the explorer's block url.
     * @param block The block to get the url for.
     * @returns The url for the block.
     */
    getBlockUrl(block: string): string {
        return this.url + this.paths.block.replace("{block}", block);
    }

    /**
     * Get the explorer's token url.
     * @param token The token to get the url for.
     * @returns The url for the token.
     */
    getTokenUrl(token: string): string {
        return this.url + this.paths.token.replace("{token}", token);
    }

    /**
     * Get the explorer's transaction url.
     * @param transaction The transaction to get the url for.
     * @returns The url for the transaction.
     */
    getTransactionUrl(transaction: string): string {
        return this.url + this.paths.transaction.replace("{tx}", transaction);
    }
}
