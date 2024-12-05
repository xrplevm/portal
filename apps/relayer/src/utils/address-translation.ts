import { decodeAccountID, encodeAccountID } from "xrpl";

/**
 * Converts an XRPL account to an EVM address.
 * @param account The XRPL account to convert.
 * @returns The EVM address.
 */
export const xrplAccountToEvmAddress = (account: string): string => {
    const accountId = decodeAccountID(account);
    return `0x${Buffer.from(accountId).toString("hex")}`;
};

/**
 * Converts an EVM address to an XRPL account.
 * @param address The EVM address to convert.
 * @returns The XRPL account.
 */
export const evmAddressToXrplAccount = (address: string): string => {
    const accountId = Buffer.from(address.slice(2), "hex");
    return encodeAccountID(accountId);
};
