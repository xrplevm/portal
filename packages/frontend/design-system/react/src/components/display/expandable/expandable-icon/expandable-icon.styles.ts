import styled, { css } from "styled-components";
import { ChevronDownIcon } from "../../../icons";
import { ExpandableIconProps } from "./expandable-icon.types";

export const ExpandableIconRoot = styled(ChevronDownIcon)<ExpandableIconProps>(
    ({ theme, open }) => css`
        color: ${theme.palette.grey[500]};
        font-size: 1.25rem;
        transform: rotate(${open ? "180deg" : "0deg"});
        transition: transform 0.4s;
    `,
);
