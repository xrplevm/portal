import { Transaction } from "xchain-sdk";
import { ActionStepProps, ActionStepSubtitle } from "../action-step";
import { Chain } from "@frontend/chain";

export type TransactionStepProps = Omit<ActionStepProps, "Icon" | "subtitle"> & {
    subtitle: Omit<ActionStepSubtitle, "success">;
    address: string;
    chain: Chain;
    transaction?: Transaction;
};
