import styled from "styled-components";

export const AxelarLogoRoot = styled.a(({ theme }) => ({
    display: "flex",
    svg: {
        color: theme.palette.text,
        width: "4.5rem",
        height: "auto",
    },
    "&:hover": {
        opacity: 0.8,
    },
}));
