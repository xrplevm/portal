import { BridgeTransferStage } from "@frontend/bridge";

export type BridgeTransactionStepProps = {
    stage: Exclude<BridgeTransferStage, BridgeTransferStage.IDLE | BridgeTransferStage.AWAIT_RECEIPT>;
    /**
     * Required as the first {stage}Requested event is fired before rendering the component
     */
    isFirst?: boolean;
};
