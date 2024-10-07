import styled, { css } from "styled-components";
import { ChainAvatarImg } from "@frontend/design-system-react/chain-avatar";
import { Image } from "@frontend/design-system-react/image";

export const TransferTokenAvatar = styled(ChainAvatarImg)(
    () => css`
        border-radius: 999px;
        width: 1.75rem;
        height: 1.75rem;
        aspect-ratio: 1;
    `,
);

export const NativeChainAvatar = styled(Image)(
    ({ theme }) => css`
        border-radius: 999px;
        position: absolute;
        width: 1.2rem;
        height: 1.2rem;
        aspect-ratio: 1;
        bottom: 60%;
        top: 40%;
        right: -20%;
        border: 2px solid ${theme.palette.grey[700]};
    `,
);
