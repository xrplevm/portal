import { Hash } from "@peersyst/react-components";
import { getExplorerUrl } from "./utils/get-explorer-url";
import { BlockchainAddressProps } from "./blockchain-address.types";

export const BlockchainAddress = ({ chain, type, address, ...rest }: BlockchainAddressProps): JSX.Element => {
    const explorerUrl = getExplorerUrl(chain.explorer, address, type);

    return <Hash hash={address} url={explorerUrl} {...rest} />;
};
