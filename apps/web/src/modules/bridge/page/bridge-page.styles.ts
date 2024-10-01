import { Col } from "@frontend/design-system-react/col";
import styled, { css } from "styled-components";

export const BridgePageRoot = styled(Col)(
    () => css`
        flex: 1;
        padding: 2rem;
        justify-content: center;
    `,
);
