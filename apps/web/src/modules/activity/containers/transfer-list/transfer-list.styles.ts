import styled, { css } from "styled-components";
import { Col } from "@frontend/design-system-react/col";
import { InfiniteList } from "@frontend/design-system-react/infinite-list";
import { TransferListRootProps } from "./transfer-list.types";

export const TransferListRoot = styled(Col)<TransferListRootProps>(
    ({ isEmpty }) => css`
        min-height: min(18rem, 50vh);
        height: 30rem;
        overflow: auto;

        justify-content: ${isEmpty ? "center" : "flex-start"};
    `,
);

export const TransferInfiniteList = styled(InfiniteList)(
    () => css`
        padding: 2rem;

        .Transfer:not(:last-child) {
            margin-bottom: 1rem;
        }
    `,
) as typeof InfiniteList;
