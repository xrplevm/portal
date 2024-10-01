import { ChainType } from "@shared/modules/chain";
import { WalletProviderId } from "../providers/types";

export type WalletInfo = {
    address: string;
    type: ChainType;
    providerId: WalletProviderId;
};

export type PersistedWallet = Pick<WalletInfo, "address" | "type" | "providerId">;
