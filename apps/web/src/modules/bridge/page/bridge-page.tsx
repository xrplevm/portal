import { Row } from "@frontend/design-system-react/row";
import { BridgeForm } from "../containers/bridge-form/bridge-form";
import { Typography } from "@frontend/design-system-react/typography";
import { AxelarLogo } from "@frontend/design-system-react/axelar-logo";
import { useTranslate } from "@frontend/locale/react";
import { BridgePageRoot } from "./bridge-page.styles";
import { useTheme } from "@frontend/design-system-react/theme";

export default function BridgePage(): JSX.Element {
    const translate = useTranslate();
    const { spacing } = useTheme();

    return (
        <BridgePageRoot gap={spacing[6]}>
            <BridgeForm />
            <Row gap={spacing[2]} justifyContent="center">
                <Typography variant="body2Regular" light>
                    {translate("poweredBy")}
                </Typography>
                <AxelarLogo />
            </Row>
        </BridgePageRoot>
    );
}
