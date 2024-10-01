import styled from "styled-components";
import { BlockchainAddress } from "@frontend/design-system-react/blockchain-address";

export const ExplorerBlockchainAddress = styled(BlockchainAddress)(() => ({
    ".Hash": {
        width: "fit-content",
    },
}));
