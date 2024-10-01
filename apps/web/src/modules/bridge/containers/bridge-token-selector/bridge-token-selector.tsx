import clsx from "clsx";
import { BridgeTokenSelectorProps } from "./bridge-token-selector.types";
import { useControlled, useDebounce } from "@peersyst/react-hooks";
import { BridgeTokenSelectorList, BridgeTokenSelectorRoot } from "./bridge-token-selector.styles";
import { TokenSelectorToolbar } from "@frontend/design-system-react/token-selector-toolbar";
import { useTheme } from "@frontend/design-system-react/theme";
import { Col } from "@frontend/design-system-react/col";
import { Divider } from "@frontend/design-system-react/divider";

export function BridgeTokenSelector({
    tokens,
    isLoading,
    onSelect,
    defaultQuery = "",
    onQueryChange: onQueryChangeProp,
    query: queryProp,
    isFiltering,
    nothingToShow,
    className,
    style,
    renderItem,
}: BridgeTokenSelectorProps): JSX.Element {
    const { spacing } = useTheme();
    const [query, setQuery] = useControlled(defaultQuery, queryProp, onQueryChangeProp);
    const { value, handleChange, debouncing: debouncingQuery } = useDebounce(query, { onChange: setQuery, delay: 500 });

    const tokenSelectorLoading = isLoading || isFiltering || debouncingQuery;

    return (
        <BridgeTokenSelectorRoot gap={spacing[8]} className={clsx("BridgeTokenSelector", className)} style={style}>
            <TokenSelectorToolbar query={value} onQueryChange={handleChange} isLoading={tokenSelectorLoading} />
            <Col flex={1} style={{ overflow: "hidden" }} gap={"1px" /* Avoids the divider of being hidden when scrolling */}>
                <Divider />
                <BridgeTokenSelectorList
                    tokens={tokens}
                    isLoading={isLoading}
                    onSelect={onSelect}
                    renderItem={renderItem}
                    nothingToShow={nothingToShow}
                    gap={5}
                />
            </Col>
        </BridgeTokenSelectorRoot>
    );
}
