import clsx from "clsx";
import { SwapButtonProps } from "./swap-button.types";
import { useBridgeChainsState } from "@frontend/bridge/ui/state";
import { ControllerFactory } from "@frontend/core/domain/controller/factory";
import { SwapButtonRoot } from "./swap-button.styles";
import { ExchangeIcon } from "@frontend/design-system-react/icons";

export function SwapButton({ style, className }: SwapButtonProps): JSX.Element {
    const { originChain, destinationChain } = useBridgeChainsState();

    const handleSwap = () => {
        ControllerFactory.bridgeTransferController.swap();
    };

    return (
        <SwapButtonRoot
            variant="secondary"
            size="md"
            disabled={!originChain && !destinationChain}
            onClick={handleSwap}
            style={style}
            className={clsx("SwapButton", className)}
        >
            <ExchangeIcon style={{ fontSize: "1.25rem" }} />
        </SwapButtonRoot>
    );
}
