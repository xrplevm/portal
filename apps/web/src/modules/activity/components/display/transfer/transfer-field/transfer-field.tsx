import { Row } from "@frontend/design-system-react/row";
import { Label } from "@frontend/design-system-react/label";
import { TransferFieldProps } from "./transfer-field.types";

export const TransferField = ({ children, label, ...props }: TransferFieldProps): JSX.Element => {
    return (
        <Label variant="caption2" label={label} gap={0} {...props}>
            <Row flex={1} css={{ width: "100%" }} alignItems="center" justifyContent="space-between">
                {children}
            </Row>
        </Label>
    );
};
