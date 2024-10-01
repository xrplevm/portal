import Amount from "@shared/amount";
import { TokenSelectorListItemProps } from "./token-selector-list-item.types";
import { useTheme } from "../../../../themes/common/hooks";
import { TokenSelectorListItemLogo, TokenSelectorListItemRoot } from "./token-selector-list-item.styles";
import { Row } from "../../../layout/row";
import { token_default_logo } from "../../../../assets/images";
import { Typography } from "../../typography";
import { Skeleton } from "../../../feedback/skeleton";
import { AmountDisplay } from "../../amount-display";
import { More } from "../../../navigation/more";

export function TokenSelectorListItem<T>({
    item,
    onSelect,
    more,
    balance = new Amount("0", 1, ""),
    isBalanceLoading = false,
}: TokenSelectorListItemProps<T>): JSX.Element {
    const { spacing } = useTheme();

    return (
        <TokenSelectorListItemRoot onClick={() => onSelect(item.value)}>
            <Row alignItems="center" gap={spacing[3]}>
                <TokenSelectorListItemLogo src={item.icon || token_default_logo} />
                <Typography variant="body1Regular">{item.label}</Typography>
            </Row>
            <Row alignItems="center" gap={spacing[3]}>
                {balance && (
                    <Skeleton loading={isBalanceLoading} style={{ width: "3rem" }}>
                        <AmountDisplay amount={balance} hideCurrency />
                    </Skeleton>
                )}
                {!!more && <More actions={more} />}
            </Row>
        </TokenSelectorListItemRoot>
    );
}

/**
 * Renders a token selector list item.
 * @param props The props for the token selector list item.
 * @param index The index of the token selector list item.
 * @returns The token selector list item.
 */
export function renderTokenSelectorListItem<T>(props: TokenSelectorListItemProps<T>, index: number): JSX.Element {
    return <TokenSelectorListItem key={`token-selector-${index}`} {...props} />;
}
