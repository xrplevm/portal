import { useTheme } from "@frontend/design-system-react/theme";
import { useTranslate } from "@frontend/locale/react";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { BridgeRoutes } from "../bridge.router";
import Amount from "@shared/amount";
import { Col } from "@frontend/design-system-react/col";
import { Typography } from "@frontend/design-system-react/typography";
import { Label } from "@frontend/design-system-react/label";
import { BridgeBlockchainAddress } from "../containers/bridge-blockchain-address/bridge-blockchain-address";
import { BridgeAddress } from "../containers/bridge-address/bridge-address";
import { AmountDisplay } from "@frontend/design-system-react/amount-display";
import { Divider } from "@frontend/design-system-react/divider";
import { Button } from "@frontend/design-system-react/button";
import { BridgeSource, BridgeToken, BridgeTransferResult } from "@frontend/bridge";

const SuccessBridgePage = (): JSX.Element => {
    const translate = useTranslate();
    const navigate = useNavigate();
    const { state: locationState } = useLocation();
    const { spacing } = useTheme();

    if (!locationState.result) navigate(BridgeRoutes.BRIDGE, { replace: true });

    const transferResult = locationState.result as BridgeTransferResult;

    const token = new BridgeToken(transferResult.token);
    const destinationToken = token.toChainToken(transferResult.destinationChain.id);

    const amount = Amount.fromDec(transferResult.amount, destinationToken.decimals, destinationToken.symbol);

    return (
        <Col gap={spacing[6]} style={{ padding: spacing[8] }}>
            <Typography variant="h4Bold" textAlign="center" fontWeight={700}>
                {translate("yourTransactionHasBeenSent")}
            </Typography>
            <Col gap={spacing[8]}>
                <Label label={translate("transferHash")}>
                    <BridgeBlockchainAddress address={transferResult.transfer?.hash} action="link" type="transfer" variant="body1Regular" />
                </Label>
                <Label label={translate("fromAddress")}>
                    <BridgeAddress source={BridgeSource.ORIGIN} address={transferResult.originAddress} />
                </Label>
                <Label label={translate("toAddress")}>
                    <BridgeAddress source={BridgeSource.DESTINATION} address={transferResult.destinationAddress} />
                </Label>
                {amount && (
                    <Label label={translate("receive")}>
                        <AmountDisplay amount={amount} />
                    </Label>
                )}
                <Divider color="grey.600" />
                <Link to={BridgeRoutes.BRIDGE}>
                    <Button fullWidth>{translate("done")}</Button>
                </Link>
            </Col>
        </Col>
    );
};

export default SuccessBridgePage;
