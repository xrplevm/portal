import { BlockchainAddress, getExplorerUrl } from "@frontend/design-system-react/blockchain-address";
import { BlockchainAddressExplorerLinkProps } from "./blockchain-address-explorer-link.types";
import { Row } from "@frontend/design-system-react/row";
import { ExplorerLink } from "../explorer-link/explorer-link";
import { useTheme } from "@frontend/design-system-react/theme";

export const BlockchainAddressExplorerLink = ({ chain, address, type, ...props }: BlockchainAddressExplorerLinkProps): JSX.Element => {
    const explorerUrl = getExplorerUrl(chain.explorer, address, type);

    const { spacing } = useTheme();

    return (
        <Row wrap wrapGap={spacing[2]} alignItems="center" justifyContent="space-between" style={{ width: "100%" }}>
            <BlockchainAddress length={16} address={address} chain={chain} type={type} {...props} />
            <ExplorerLink url={explorerUrl} style={{ textAlign: "end" }} />
        </Row>
    );
};
