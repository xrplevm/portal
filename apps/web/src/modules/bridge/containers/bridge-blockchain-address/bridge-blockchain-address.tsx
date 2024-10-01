import { Hash } from "@frontend/design-system-react/hash";
import { BridgeBlockchainAddressProps } from "./bridge-blockchain-address.types";
import { useGetBridgeExplorerUrl } from "./hooks/useGetBridgeExplorerUrl";

export function BridgeBlockchainAddress({ type, address, ...rest }: BridgeBlockchainAddressProps): JSX.Element {
    const explorerUrl = useGetBridgeExplorerUrl(address, type);

    return <Hash url={explorerUrl} hash={address} {...rest} />;
}
