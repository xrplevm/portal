import { Chain } from "@frontend/chain";
import { HashProps } from "@peersyst/react-components";

export type BlockchainAddressType = "account" | "transaction";

export interface BlockchainAddressProps extends Omit<HashProps, "numberOfLines" | "children" | "hash" | "hashToShareData"> {
    chain: Chain;
    type: BlockchainAddressType;
    address: string;
    addressToShareData?: HashProps["hashToShareData"];
}
