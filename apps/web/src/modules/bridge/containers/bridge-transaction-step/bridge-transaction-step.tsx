import { useEffect, useState } from "react";
import { BridgeSource, Confirmed, Transaction } from "xchain-sdk";
import { BridgeTransactionStepProps } from "./bridge-transaction-step.types";
import { useTranslate } from "@frontend/locale/react";
import { useBridgeSourceChainState, useBridgeSourceWalletState } from "@frontend/bridge/ui/hooks";
import { ControllerFactory } from "@frontend/core/domain/controller/factory";
import { UIError } from "@frontend/core/ui/error";
import { LocaleErrorResource, LocaleTranslationResource } from "@frontend/locale";
import { TransactionStep } from "@frontend/design-system-react/transaction-step";
import { upperFirst } from "@shared/string";

export function BridgeTransactionStep({ stage, isFirst = false }: BridgeTransactionStepProps): JSX.Element {
    const translate = useTranslate();
    const translateError = useTranslate("error");

    const bridgeSide = stage.toLocaleLowerCase().includes("claim") ? BridgeSource.DESTINATION : BridgeSource.ORIGIN;

    const bridgeChain = useBridgeSourceChainState(bridgeSide, true);
    const bridgeWallet = useBridgeSourceWalletState(bridgeSide);

    const [waiting, setWaiting] = useState(isFirst);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);
    const [transaction, setTransaction] = useState<Transaction | undefined>(undefined);

    useEffect(() => {
        // @pre: transfer has started
        const removeOnStageRequested = ControllerFactory.bridgeTransferController.on(`${stage}Requested`, () => {
            setWaiting(true);
            setLoading(false);
            setSuccess(false);
            setError(undefined);
        });
        const removeOnStageSigned = ControllerFactory.bridgeTransferController.on(`${stage}Signed`, () => {
            setWaiting(false);
            setLoading(true);
        });
        const removeOnStageConfirmed = ControllerFactory.bridgeTransferController.on(`${stage}Confirmed`, (tx: Confirmed<Transaction>) => {
            setTransaction(tx);
            setLoading(false);
            setSuccess(true);
        });
        const removeOnStageError = ControllerFactory.bridgeTransferController.on(`${stage}Failed`, (error) => {
            setLoading(false);
            const uiError = new UIError(error.message, error.params);
            setError(
                translateError(
                    [uiError.message as LocaleErrorResource, "somethingWentWrong"],
                    uiError.data ? { ...uiError.data } : undefined,
                ),
            );
        });
        return () => {
            removeOnStageRequested();
            removeOnStageSigned();
            removeOnStageConfirmed();
            removeOnStageError();
        };
    }, [stage]);

    if (bridgeWallet.connection !== "connected") throw new Error(`${upperFirst(bridgeSide)} wallet is not connected`);

    return (
        <TransactionStep
            address={bridgeWallet.address}
            chain={bridgeChain}
            title={translate([
                `${bridgeChain.type}${upperFirst(stage)}StageTitle` as LocaleTranslationResource,
                `${stage}StageTitle` as LocaleTranslationResource,
            ])}
            subtitle={{
                default: translate("signatureMessage", { providerId: bridgeWallet.providerId }),
                loading: translate("broadcastingMessage", { chain: bridgeChain.name }),
            }}
            waiting={waiting}
            loading={loading}
            success={success}
            error={error}
            transaction={transaction}
        />
    );
}
