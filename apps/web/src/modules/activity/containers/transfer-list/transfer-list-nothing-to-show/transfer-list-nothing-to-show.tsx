import { useBridgeWalletsState } from "@frontend/bridge/ui/state";
import { Typography } from "@frontend/design-system-react/typography";
import { useTranslate } from "@frontend/locale/react";
import { Link } from "react-router-dom";
import { Col } from "@frontend/design-system-react/col";
import { BridgeRoutes } from "../../../../bridge/bridge.router";

export const TransferListNothingToShow = (): JSX.Element => {
    const translate = useTranslate();
    const { originWallet, destinationWallet } = useBridgeWalletsState();
    return (
        <Col flex={1} justifyContent="center" alignItems="center">
            {originWallet.connection === "connected" && destinationWallet.connection === "connected" ? (
                <Typography variant="h6Bold" fontWeight={400} color="grey.500" textAlign="center">
                    {translate("hereYouWillSeeYourTransfers")}
                </Typography>
            ) : (
                <Link to={BridgeRoutes.BRIDGE}>
                    <Typography variant="h6Bold">{translate("connectYourWallets")}</Typography>
                </Link>
            )}
        </Col>
    );
};
