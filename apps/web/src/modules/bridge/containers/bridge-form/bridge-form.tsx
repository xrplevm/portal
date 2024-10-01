import { useAreWalletsConnected } from "@frontend/bridge/ui/hooks";
import { useTransfer } from "@frontend/bridge/ui/queries";
import { useTheme } from "@frontend/design-system-react/theme";
import { useTranslate } from "@frontend/locale/react";
import { useEffect, useRef, useState } from "react";
import { BridgeFormData, BridgeFormFields } from "./bridge-form.types";
import { Col } from "@frontend/design-system-react/col";
import { Button } from "@frontend/design-system-react/button";
import { AlertCallout } from "@frontend/design-system-react/alert-callout";
import { BridgeSources } from "../bridge-sources/bridge-sources";
import { BridgeTransferModal } from "../bridge-transfer-modal/bridge-transfer-modal";
import BridgeTransferInput from "../bridge-transfer-input/bridge-transfer-input";
import { BridgeTransferDetails } from "../bridge-transfer-details/bridge-transfer-details";
import { Form } from "@frontend/design-system-react/form";
import { BridgeTransferStartData } from "@frontend/bridge";
import { ControllerFactory } from "../../../../core/domain/factories/controller.factory";

export function BridgeForm(): JSX.Element {
    const translate = useTranslate();
    const { spacing } = useTheme();

    const areWalletsConnected = useAreWalletsConnected();
    const isBridgeConfigSet = true;
    // TODO: Define
    const transferError = undefined;

    const { mutate: transfer, isPending: transferring } = useTransfer();

    const startData = useRef<BridgeTransferStartData | undefined>(undefined);
    const [openBridgeTransferModal, setOpenBridgeTransferModal] = useState(false);

    useEffect(() => {
        const removeOnStart = ControllerFactory.bridgeTransferController.on("start", (data) => {
            startData.current = data;
            setOpenBridgeTransferModal(true);
        });
        return () => {
            removeOnStart();
        };
    }, []);

    const handleFormSubmit = async ({ amount }: BridgeFormData) => {
        transfer(amount);
    };

    return (
        <>
            <Form onSubmit={handleFormSubmit}>
                <Col gap={spacing[8]}>
                    <Col gap={spacing[7]}>
                        <Col gap={spacing[5]}>
                            <BridgeSources />
                            {areWalletsConnected && <BridgeTransferInput name={BridgeFormFields.AMOUNT} required />}
                        </Col>
                        {!!transferError && <AlertCallout type="error" content={transferError} />}
                        {areWalletsConnected && isBridgeConfigSet && <BridgeTransferDetails />}
                    </Col>
                    <Button type="submit" disabled={!areWalletsConnected || !isBridgeConfigSet} loading={transferring}>
                        {translate("transfer")}
                    </Button>
                </Col>
            </Form>
            {startData.current && (
                <BridgeTransferModal
                    open={openBridgeTransferModal}
                    onClose={() => setOpenBridgeTransferModal(false)}
                    onExited={() => (startData.current = undefined)}
                    data={startData.current}
                />
            )}
        </>
    );
}
