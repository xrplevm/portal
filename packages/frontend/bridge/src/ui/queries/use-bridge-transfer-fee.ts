import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { UseExternalQueryOptions } from "@frontend/query/react";

/**
 * Gets the transfer fee for the bridge.
 * @param options Options for the query.
 * @returns The transfer fee query result.
 */
export function useBridgeTransferFee<T = string>(options: UseExternalQueryOptions<string, Error, T, any[]> = {}): UseQueryResult<T> {
    return useQuery({
        queryKey: ["bridge-transfer-fee"],
        queryFn: () => Promise.resolve("0"),
        ...options,
    });
}
