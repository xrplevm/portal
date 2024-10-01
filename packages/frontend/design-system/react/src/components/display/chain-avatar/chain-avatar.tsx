import { Row } from "@peersyst/react-components";
import { ChainAvatarProps } from "./chain-avatar.types";
import { getNetworkType, NetworkType } from "@shared/modules/network";
import { ChainAvatarImg, ChainNetworkBadge } from "./chain-avatar.styles";

export const ChainAvatar = ({ imageUrl, name }: ChainAvatarProps): JSX.Element => {
    const networkType = getNetworkType(name);

    return (
        <Row style={{ position: "relative", display: "inline-block" }}>
            <ChainAvatarImg src={imageUrl} alt={`${name}-logo`} />
            {networkType !== NetworkType.MAINNET && <ChainNetworkBadge label={networkType} />}
        </Row>
    );
};
