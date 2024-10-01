import { ChainAddressProps } from "./chain-address.types";
import { BlockchainAddress } from "../blockchain-address";
import { useTheme } from "../../../themes/common/hooks";
import { Row } from "../../layout/row";
import { Chip } from "../chip";

export const ChainAddress = ({ address, chain }: ChainAddressProps): JSX.Element => {
    const { spacing } = useTheme();

    return (
        <Row flex={1} gap={spacing[2]} alignItems="center" style={{ width: "100%" }}>
            <Chip label={chain.name} variant="success" />
            <BlockchainAddress chain={chain} variant="body1Regular" action="link" address={address} type="account" style={{ flex: 1 }} />
        </Row>
    );
};
