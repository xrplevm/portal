import { useEffect, useMemo } from "react";
import { createModal, Modal, ModalProps } from "@frontend/design-system-react/modal";
import { WalletConnectionModalProps } from "./wallet-connection-modal.types";
import { useTranslate, useTranslationExists } from "@frontend/locale/react";
import { useToast } from "@frontend/design-system-react/toast";
import { useRequestWalletSideConnection } from "@frontend/bridge/ui/queries";
import { getWalletSourceProvider } from "@frontend/bridge/ui/utils";
import { LocaleErrorResource, LocaleTranslationResource } from "@frontend/locale";
import { useConfig } from "@frontend/config/react";
import { WALLET_CONNECTIONS } from "../wallet-connections";
import { WalletConnectionContent } from "./wallet-connecion-modal.styles";
import { IWalletProvider } from "@frontend/wallet/providers/interfaces";
import { isDomainError } from "@frontend/core/domain/error";
import { BridgeWalletsErrors } from "@frontend/bridge/domain/errors";

export const WalletConnectionModal = createModal<WalletConnectionModalProps & ModalProps>(function WalletConnectionModal({
    providerId,
    side,
    ...modalProps
}): JSX.Element {
    const translate = useTranslate();
    const translateError = useTranslate("error");
    const translationExists = useTranslationExists();
    const { showToast } = useToast();
    const walletProviders = useConfig("walletProviders");

    const { data, isLoading } = useRequestWalletSideConnection(side, providerId);

    useEffect(() => {
        let walletProvider: IWalletProvider | undefined = undefined;

        try {
            walletProvider = getWalletSourceProvider(side);
        } catch (e) {
            if (
                !isDomainError(e) ||
                (e.message !== BridgeWalletsErrors.ORIGIN_WALLET_PROVIDER_NOT_SET &&
                    e.message !== BridgeWalletsErrors.DESTINATION_WALLET_PROVIDER_NOT_SET)
            )
                throw e;
        }

        const removeOnConnect = walletProvider!.on("connect", () => modalProps.close());
        const removeOnConnectionError = walletProvider!.on("connectionError", (_error, message) => {
            modalProps.close();
            showToast(translateError(message as LocaleErrorResource, { provider: walletProviders[providerId].name }), {
                type: "error",
            });
        });

        return () => {
            removeOnConnect?.();
            removeOnConnectionError?.();
        };
    }, [side]);

    const WalletProviderConnection = useMemo(() => WALLET_CONNECTIONS[providerId], [providerId]);

    const titleTranslationKey = `${providerId}ConnectionTitle`;
    const subtitleTranslationKey = `${providerId}ConnectionSubtitle`;
    const title = translationExists(titleTranslationKey) ? translate(titleTranslationKey as LocaleTranslationResource) : undefined;
    const subtitle = translationExists(subtitleTranslationKey) ? translate(subtitleTranslationKey as LocaleTranslationResource) : undefined;

    return (
        <Modal style={{ width: "39.5rem" }} title={title} subtitle={subtitle} {...modalProps}>
            <WalletConnectionContent>
                <WalletProviderConnection data={data} isLoading={isLoading} />
            </WalletConnectionContent>
        </Modal>
    );
});
