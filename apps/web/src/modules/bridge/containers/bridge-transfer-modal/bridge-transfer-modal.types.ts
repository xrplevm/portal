import { BridgeTransferStartData } from "@frontend/bridge";
import { CommonModalComponentProps } from "@frontend/design-system-react/modal";

export type BridgeTransferModalProps = CommonModalComponentProps & {
    data: BridgeTransferStartData;
};
