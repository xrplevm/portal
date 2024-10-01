export type BridgeExplorerObject = {
    name: string;
    url: string;
    icon: string;
    transferPath: string;
};

export class BridgeExplorer {
    name: string;
    url: string;
    icon: string;
    transferPath: string;

    constructor(bridgeExplorer: BridgeExplorerObject) {
        this.name = bridgeExplorer.name;
        this.url = bridgeExplorer.url;
        this.icon = bridgeExplorer.icon;
        this.transferPath = bridgeExplorer.transferPath;
    }

    /**
     * Get the transfer url.
     * @param hash The hash of the transfer.
     * @returns The url of the transfer.
     */
    getTransferUrl(hash: string): string {
        return this.url + this.transferPath.replace("{hash}", hash);
    }
}
