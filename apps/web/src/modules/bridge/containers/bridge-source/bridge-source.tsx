import clsx from "clsx";
import { BridgeSource as BridgeSourceEnum } from "xchain-sdk";
import { BridgeSourceProps } from "./bridge-source.types";
import { useTranslate } from "@frontend/locale/react";
import { FormGroup } from "@frontend/design-system-react/form-group";
import { Col } from "@frontend/design-system-react/col";
import { BridgeChainSelector } from "../bridge-chain-selector/bridge-chain-selector";
import { Divider } from "@frontend/design-system-react/divider";
import { BridgeWalletSelector } from "../bridge-wallet-selector/bridge-wallet-selector";

export function BridgeSource({ source, style, className }: BridgeSourceProps): JSX.Element {
    const translate = useTranslate();

    return (
        <FormGroup
            label={translate(source === BridgeSourceEnum.ORIGIN ? "from" : "to")}
            style={style}
            className={clsx("BridgeSource", className)}
        >
            <Col>
                <BridgeChainSelector
                    label={translate("network")}
                    source={source}
                    style={{ borderBottomLeftRadius: "0", borderBottomRightRadius: "0" }}
                />
                <Divider />
                <BridgeWalletSelector
                    label={translate("wallet")}
                    side={source}
                    style={{ borderTopLeftRadius: "0", borderTopRightRadius: "0" }}
                />
            </Col>
        </FormGroup>
    );
}
