import { useEffect, useState } from "react";
import { Row } from "@peersyst/react-components";
import { clsx } from "clsx";
import { ActionStepProps, ActionStepStatus } from "./action-step.types";
import { ActionStepRoot, ActionStepSubtitle, ActionStepSubtitleWrapper, ActionStepTitle } from "./action-step.styles";
import { ActionStepIcon } from "./action-step-icon/action-step-icon";

export const ActionStep = ({
    title,
    subtitle,
    Icon,
    waiting,
    loading,
    success,
    error,
    className,
    children,
    ...rest
}: ActionStepProps): JSX.Element => {
    const [status, setStatus] = useState<ActionStepStatus>("idle");

    useEffect(() => {
        if (success) setStatus("success");
        else if (error) setStatus("error");
        else if (loading) setStatus("loading");
        else if (waiting) setStatus("waiting");
        else setStatus("idle");
    }, [waiting, loading, success, error]);

    return (
        <ActionStepRoot className={clsx("action-step", status, className)} {...rest}>
            <ActionStepTitle>{title}</ActionStepTitle>
            <ActionStepSubtitleWrapper status={status} className={clsx("action-step-subtitle", status)}>
                <ActionStepIcon status={status} style={{ fontSize: "1.5rem" }} Icon={Icon} />
                <ActionStepSubtitle>
                    {status === "error" ? error || subtitle["error"] : subtitle[status] || subtitle.default}
                </ActionStepSubtitle>
            </ActionStepSubtitleWrapper>
            {children && (
                <Row flex={1} style={{ marginLeft: "2rem" }}>
                    {children}
                </Row>
            )}
        </ActionStepRoot>
    );
};
