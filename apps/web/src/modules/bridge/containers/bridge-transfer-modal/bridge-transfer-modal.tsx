import { createModal, Modal } from "@frontend/design-system-react/modal";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BridgeTransferModalProps } from "./bridge-transfer-modal.types";
import { useTranslate } from "@frontend/locale/react";
import { ControllerFactory } from "@frontend/core/domain/controller/factory";
import { Tabs, TabPanel } from "@frontend/design-system-react/tabs";
import { BridgeRoutes } from "../../bridge.router";
import { BridgeTransferSteps } from "../bridge-transfer-steps/bridge-transfer-steps";
import { BridgeTransferProcessing } from "../bridge-transfer-processing/bridge-transfer-processing";

export const BridgeTransferModal = createModal<BridgeTransferModalProps>(function BridgeTransferModal({
    data,
    onClose,
    ...modalProps
}): JSX.Element {
    const translate = useTranslate();
    const navigate = useNavigate();
    const [tabIndex, setTabIndex] = useState(0);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        // @pre: transfer has started
        const removeOnFailed = ControllerFactory.bridgeTransferController.on("failed", () => {
            setIsError(true);
        });
        const removeOnAwaitReceiptStarted = ControllerFactory.bridgeTransferController.on("awaitReceiptStarted", () => {
            setTabIndex(1);
        });
        const removeOnCompleted = ControllerFactory.bridgeTransferController.on("completed", (result) => {
            navigate(BridgeRoutes.BRIDGE_SUCCESS, { state: { result: { ...result } } });
            onClose?.();
        });
        return () => {
            removeOnFailed();
            removeOnAwaitReceiptStarted();
            removeOnCompleted();
        };
    }, []);

    return (
        <Modal
            title={tabIndex === 0 ? translate("approveTransaction") : undefined}
            closable={isError}
            style={{ width: "35rem" }}
            onClose={onClose}
            {...modalProps}
        >
            <Tabs index={tabIndex}>
                <TabPanel index={0}>
                    <BridgeTransferSteps data={data} />
                </TabPanel>
                <TabPanel index={1}>
                    <BridgeTransferProcessing />
                </TabPanel>
            </Tabs>
        </Modal>
    );
});
