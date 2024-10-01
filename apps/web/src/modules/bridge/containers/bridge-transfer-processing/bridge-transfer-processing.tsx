import { useTranslate } from "@frontend/locale/react";
import { useEffect, useState } from "react";
import { useTheme } from "styled-components";
import { ControllerFactory } from "../../../../core/domain/factories/controller.factory";
import { Col } from "@frontend/design-system-react/col";
import { ProcessErrorIcon, ProcessImage } from "./bridge-transfer-processing.styles";
import { Typography } from "@frontend/design-system-react/typography";

export function BridgeTransferProcessing(): JSX.Element {
    const translate = useTranslate();
    const translateError = useTranslate("error");
    const { spacing } = useTheme();

    const [isError, setIsError] = useState(false);

    useEffect(() => {
        // @pre: transfer has started
        const removeOnAttestationsStarted = ControllerFactory.bridgeTransferController.on("awaitReceiptFailed", () => {
            setIsError(true);
        });
        return () => {
            removeOnAttestationsStarted();
        };
    }, []);

    return (
        <Col gap={spacing[4]} alignItems={"center"} flex={1}>
            {isError && (
                <>
                    <ProcessErrorIcon />
                    <Typography variant="body1" color="grey.200">
                        {translateError("awaitReceiptError")}
                    </Typography>
                </>
            )}
            {!isError && (
                <>
                    <ProcessImage />
                    <Typography variant="body1" color="grey.200">
                        {translate("transactionIsProcessing")}
                    </Typography>
                </>
            )}
        </Col>
    );
}
