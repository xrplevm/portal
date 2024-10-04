import { useMemo } from "react";
import { BridgeSource } from "xchain-sdk";
import { BridgeChainSelectorProps } from "./bridge-chain-selector.types";
import { useTranslate } from "@frontend/locale/react";
import { useBridgeChainsState } from "@frontend/bridge/ui/state";
import { useGetChains } from "@frontend/chain/ui/queries";
import { ControllerFactory } from "@frontend/core/domain/controller/factory";
import { ChainSelect } from "@frontend/design-system-react/chain-select";
import { Chain } from "@frontend/chain";
import { useConfig } from "@frontend/config/react";

export function BridgeChainSelector({
    disabled = false,
    placeholder: placeholderProp,
    source: side,
    ...rest
}: BridgeChainSelectorProps): JSX.Element {
    const translate = useTranslate();
    const featuredChains = useConfig("featuredChains");

    const placeholder = placeholderProp ?? translate("select");

    const { originChain, destinationChain } = useBridgeChainsState();

    const [sideChain, otherSideChain] = side === "origin" ? [originChain, destinationChain] : [destinationChain, originChain];

    const { data: allChains = [], isLoading } = useGetChains();
    const chains = useMemo(() => {
        if (!otherSideChain) return allChains;
        else if (featuredChains.includes(otherSideChain.id)) return allChains.filter((chain) => chain.id !== otherSideChain.id);
        else return allChains.filter((chain) => featuredChains.includes(chain.id));
    }, [allChains, otherSideChain, featuredChains]);

    const handleChange = (chain: Chain) => {
        if (side === BridgeSource.ORIGIN) ControllerFactory.bridgeChainsController.setOriginChain(chain);
        else ControllerFactory.bridgeChainsController.setDestinationChain(chain);
    };

    return (
        <ChainSelect
            chains={chains}
            value={sideChain}
            onChange={handleChange}
            disabled={disabled || isLoading}
            placeholder={placeholder}
            {...rest}
        />
    );
}
