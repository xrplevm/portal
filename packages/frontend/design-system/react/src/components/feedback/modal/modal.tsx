import { useControlled } from "@peersyst/react-hooks";
import { ModalProps } from "./modal.types";
import { CloseModalButton, ModalHeader, ModalRoot } from "./modal.styles";
import { Col } from "../../layout/col";
import { Typography } from "../../display/typography";

export const Modal = ({
    open: openProp,
    title,
    children,
    elevation = 0,
    onClose,
    closable = true,
    subtitle,
    ...rest
}: ModalProps): JSX.Element => {
    const [open, setOpen] = useControlled(true, openProp);

    const handleClose = () => {
        onClose?.();
        setOpen(false);
    };

    return (
        <ModalRoot open={open} elevation={elevation} onClose={handleClose} closable={closable} {...rest}>
            <Col style={{ height: "100%" }} gap="2rem" className="ModalContainer">
                {title && (
                    <ModalHeader>
                        <Typography variant="h4Bold" fontWeight={700}>
                            {title}
                        </Typography>
                        {subtitle && (
                            <Typography variant="body1Regular" color="grey.200">
                                {subtitle}
                            </Typography>
                        )}
                    </ModalHeader>
                )}
                {closable && <CloseModalButton onClick={handleClose} />}
                {children}
            </Col>
        </ModalRoot>
    );
};
