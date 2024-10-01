import styled, { css } from "styled-components";
import { processing } from "../../../../assets/images";
import { ErrorIcon } from "@frontend/design-system-react/icons";

export const ProcessImage = styled.img.attrs({ src: processing, alt: "processing-image" })`
    width: 9.875rem;
`;

export const ProcessErrorIcon = styled(ErrorIcon)(
    ({ theme }) => css`
        font-size: 9rem;
        margin: 0.4375rem 0;
        color: ${theme.palette.status.error};
        opacity: 0.5;
    `,
);
