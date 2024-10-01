import { TransferToken } from "./transfer-token/transfer-token";
import { Row } from "@frontend/design-system-react/row";
import { Col } from "@frontend/design-system-react/col";
import { Typography } from "@frontend/design-system-react/typography";
import { TransferField } from "./transfer-field/transfer-field";
import BlockchainAddressExplorerLink from "../../../../blockchain/components/navigation/blockchain-address-explorer-link/blockchain-address-explorer-link";
import { useTranslate } from "@frontend/locale/react";
import Amount from "@shared/amount";
import { TransferProps } from "./transfer.types";
import { ChainSequence } from "@frontend/design-system-react/chain-sequence";
import { DateDisplay } from "@frontend/design-system-react/date-display";
import { useTheme } from "@frontend/design-system-react/theme";
import { DateFormat } from "@frontend/misc/ui/date";
import { Expandable } from "@frontend/design-system-react/expandable";

// TODO: https://www.notion.so/Axelar-Transfer-tokens-from-XRPL-b5610ee16a82430eba9bbd7789c74642?pvs=4
export const Transfer = ({ transfer }: TransferProps): JSX.Element => {
    const translate = useTranslate();
    const { spacing } = useTheme();

    // TODO: https://www.notion.so/Axelar-Transfer-tokens-from-XRPL-b5610ee16a82430eba9bbd7789c74642?pvs=4
    const amount = new Amount(transfer.value, 0, "");

    return (
        <Expandable className="Transfer">
            <Expandable.Display>
                <Row flex={1} alignItems="center" justifyContent="space-between">
                    <ChainSequence origin={transfer.sourceChain} destination={transfer.destinationChain} />
                    <Row alignItems="center" gap={spacing[4]}>
                        <TransferToken
                            tokenImageUrl={transfer.lockingChainToken.imageUrl}
                            lockingChainImageUrl={transfer.lockingChain.imageUrl}
                        />
                        <Col justifyContent="center" alignItems="start">
                            <Row gap={spacing[2]}>
                                <Typography variant="body1" textAlign="right" fontWeight={700}>
                                    {amount.formatAmount()} {amount.currency}
                                </Typography>
                            </Row>
                            <DateDisplay variant="caption2" color="grey.400" textAlign="right" date={transfer.createdAt} />
                        </Col>
                    </Row>
                </Row>
            </Expandable.Display>
            <Expandable.Body>
                <Expandable.Content>
                    <Col gap={spacing[4]}>
                        <TransferField label={translate("from")}>
                            <BlockchainAddressExplorerLink
                                chain={transfer.sourceChain}
                                address={transfer.from}
                                variant="body1"
                                type="account"
                            />
                        </TransferField>
                        <TransferField label={translate("to")}>
                            <BlockchainAddressExplorerLink
                                variant="body1"
                                type="account"
                                address={transfer.to}
                                chain={transfer.destinationChain}
                            />
                        </TransferField>
                    </Col>
                </Expandable.Content>
                <Expandable.Footer>
                    <Row alignItems="flex-start" justifyContent="space-between">
                        <TransferField label={translate("amount")}>
                            <Row gap={spacing[2]}>
                                <Typography variant="body1">
                                    {amount.formatAmount()} {amount.currency}
                                </Typography>
                            </Row>
                        </TransferField>
                        <TransferField label={translate("received")}>
                            <Row gap={spacing[2]}>
                                <Typography variant="body1">
                                    {amount.formatAmount()} {amount.currency}
                                </Typography>
                            </Row>
                        </TransferField>
                        <TransferField label={translate("date")} css={{ width: "fit-content" }}>
                            <Row gap={spacing[2]}>
                                <DateDisplay format={DateFormat.DATE_TIME} variant="body1" date={transfer.createdAt} />
                            </Row>
                        </TransferField>
                    </Row>
                </Expandable.Footer>
            </Expandable.Body>
        </Expandable>
    );
};
