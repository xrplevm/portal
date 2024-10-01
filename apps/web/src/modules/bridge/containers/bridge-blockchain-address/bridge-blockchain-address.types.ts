import { HashProps } from "@frontend/design-system-react/hash";

export type BridgeBlockchainAddressType = "transfer";

export type BridgeBlockchainAddressProps = Omit<HashProps, "url" | "type" | "hash"> & {
    address: string;
    type: BridgeBlockchainAddressType;
};
