import { UseInfiniteQueryResult } from "@tanstack/react-query";
import { Transfer } from "../../common";
import { useGetPaginatedTransfers, UseGetPaginatedTransfersOptions } from "./use-get-paginated-transfers";

export type UseGetTransfersOptions<T = Transfer[]> = Omit<UseGetPaginatedTransfersOptions<T>, "select"> & {
    select?: (data: Transfer[]) => T;
};

/**
 * Get transfers.
 * @param options The query options.
 * @returns The transfers query result.
 */
export function useGetTransfers<T = Transfer[]>({
    select = (x) => x as T,
    ...restOptions
}: UseGetTransfersOptions<T> = {}): UseInfiniteQueryResult<T, unknown> {
    return useGetPaginatedTransfers<T>({
        select: (data) => select(data?.pages.reduce((acc, page) => [...acc, ...page.items], [] as Transfer[])),
        ...restOptions,
    });
}
