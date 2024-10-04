import { useBridgeChainsState, useBridgeWalletsState } from "@frontend/bridge/ui/state";
import { Transfer } from "../../../common";
import { InfiniteData, UseInfiniteQueryOptions, UseInfiniteQueryResult } from "@tanstack/react-query";
import { useGetPaginatedTransfersPaginationMerger } from "./use-get-paginated-transfers-pagination-merger";
import { PaginationMergerGetPageParams, PaginationMergerGetPageResult } from "../../../../../../shared/utils/src";
import { useInfiniteQuery } from "@tanstack/react-query";

export type UseGetPaginatedTransfersOptions<T = InfiniteData<PaginationMergerGetPageResult<Transfer>>> = Omit<
    UseInfiniteQueryOptions<
        PaginationMergerGetPageResult<Transfer>,
        Error,
        T,
        PaginationMergerGetPageResult<Transfer>,
        any[],
        PaginationMergerGetPageParams
    >,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
>;

/**
 * Get the query key for the paginated transfers query.
 * @param sourceChain The source chain.
 * @param destinationChain The destination chain.
 * @param originWalletAddress The origin wallet address.
 * @returns The query key.
 */
export function getPaginatedTransfersQueryKey(sourceChain?: string, destinationChain?: string, originWalletAddress?: string): any {
    return ["paginated-transfers", sourceChain, destinationChain, originWalletAddress];
}

/**
 * Check if the paginated transfers are enabled.
 * @param enabled The enabled flag.
 * @returns The enabled flag.
 */
export function usePaginatedTransfersEnabled(enabled = true): boolean {
    const { originChain, destinationChain } = useBridgeChainsState();
    const { originWallet, destinationWallet } = useBridgeWalletsState();

    return (
        enabled &&
        !!originChain &&
        !!destinationChain &&
        originWallet.connection === "connected" &&
        destinationWallet.connection === "connected"
    );
}

/**
 * Get paginated transfers.
 * @param options The query options.
 * @returns The paginated transfers query result.
 */
export function useGetPaginatedTransfers<T = InfiniteData<PaginationMergerGetPageResult<Transfer>>>({
    enabled = true,
    select = (x) => x as T,
    staleTime = 3000,
    ...restOptions
}: UseGetPaginatedTransfersOptions<T> = {}): UseInfiniteQueryResult<T> {
    const { originChain, destinationChain } = useBridgeChainsState();
    const { originWallet } = useBridgeWalletsState();

    const originWalletAddress = originWallet.connection === "connected" ? originWallet.address : undefined;

    const getPaginatedTransfersPaginationMerger = useGetPaginatedTransfersPaginationMerger({
        sourceChainId: originChain?.id,
        destinationChainId: destinationChain?.id,
        sourceWalletAddress: originWalletAddress,
    });

    const queryEnabled = usePaginatedTransfersEnabled(enabled as boolean);
    const queryKey = getPaginatedTransfersQueryKey(originChain?.id, destinationChain?.id, originWalletAddress);

    return useInfiniteQuery<PaginationMergerGetPageResult<Transfer>, Error, T, any[], PaginationMergerGetPageParams>({
        queryKey,
        queryFn: ({ pageParam }) => getPaginatedTransfersPaginationMerger.getPage(10, pageParam),
        enabled: queryEnabled,
        initialPageParam: undefined,
        getNextPageParam: (lastPage) =>
            lastPage.isLastPage
                ? undefined
                : {
                      nextPageParams: lastPage.nextPageParams,
                      rest: lastPage.rest,
                  },
        select,
        staleTime,
        ...restOptions,
    });
}
