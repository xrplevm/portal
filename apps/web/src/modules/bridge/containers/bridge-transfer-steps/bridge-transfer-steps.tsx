import { BridgeTransferStepsProps } from "./bridge-transfer-steps.types";
import { useTheme } from "@frontend/design-system-react/theme";
import { Col } from "@frontend/design-system-react/col";
import { BridgeTransactionStep } from "../bridge-transaction-step/bridge-transaction-step";
import { Divider } from "@frontend/design-system-react/divider";
import { BridgeTransferSummary } from "../bridge-transfer-summary/bridge-transfer-summary";
import { BridgeTransferDetails } from "../bridge-transfer-details/bridge-transfer-details";
import { BridgeTransferStage } from "@frontend/bridge";

export function BridgeTransferSteps({ data }: BridgeTransferStepsProps): JSX.Element {
    const { spacing } = useTheme();

    return (
        <Col gap={spacing[4]}>
            <Col gap={spacing[4]}>
                {data.isTrustReceiptRequired && (
                    <>
                        <BridgeTransactionStep stage={BridgeTransferStage.TRUST_RECEIPT} isFirst />
                        <Divider />
                    </>
                )}
                {data.isTrustTransferRequired && (
                    <>
                        <BridgeTransactionStep stage={BridgeTransferStage.TRUST_TRANSFER} isFirst={!data.isTrustReceiptRequired} />
                        <Divider />
                    </>
                )}
                <BridgeTransactionStep
                    stage={BridgeTransferStage.TRANSFER}
                    isFirst={!data.isTrustReceiptRequired && !data.isTrustTransferRequired}
                />
            </Col>
            <Divider />
            <BridgeTransferSummary amount={data.amount} />
            <Divider />
            <BridgeTransferDetails />
        </Col>
    );
}
