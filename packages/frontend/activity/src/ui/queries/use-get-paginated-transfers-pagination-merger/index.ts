import { useBridgeChainsState, useBridgeWalletsState } from "@frontend/bridge/ui/state";
import { Transfer } from "../../../common";
import { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";
import { useGetPaginatedTransfersPaginationMerger } from "./use-get-paginated-transfers";
import { PaginationMergerGetPageParams, PaginationMergerGetPageResult } from "../../../../../../shared/utils/src";
import { useInfiniteQuery } from "@tanstack/react-query";

export interface UseGetPaginatedTransfersProps {
    page: number;
    pageSize: number;
}

/**
 * Get the query key for the paginated transfers query.
 * @param page The page number.
 * @param pageSize The page size.
 * @param sourceChain The source chain.
 * @param destinationChain The destination chain.
 * @param originWalletAddress The origin wallet address.
 * @returns The query key.
 */
export function getPaginatedTransfersQueryKey(
    page: number,
    pageSize: number,
    sourceChain?: string,
    destinationChain?: string,
    originWalletAddress?: string,
): any {
    return ["paginated-transfers", page, pageSize, sourceChain, destinationChain, originWalletAddress];
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
 * @param _ The options for the query.
 * @returns The paginated transfers.
 */
export function useGetPaginatedTransfers(
    { page, pageSize }: UseGetPaginatedTransfersProps = { page: 1, pageSize: 10 },
): UseInfiniteQueryResult<InfiniteData<PaginationMergerGetPageResult<Transfer>, Error>> {
    const { originChain, destinationChain } = useBridgeChainsState();
    const { originWallet } = useBridgeWalletsState();

    const originWalletAddress = originWallet.connection === "connected" ? originWallet.address : undefined;

    const getPaginatedTransfersPaginationMerger = useGetPaginatedTransfersPaginationMerger({
        page,
        pageSize,
        sourceChainId: originChain?.id,
        destinationChainId: destinationChain?.id,
        sourceWalletAddress: originWalletAddress,
    });

    const queryEnabled = usePaginatedTransfersEnabled();
    const queryKey = getPaginatedTransfersQueryKey(page, pageSize, originChain?.id, destinationChain?.id, originWalletAddress);

    return useInfiniteQuery<
        PaginationMergerGetPageResult<Transfer>,
        Error,
        InfiniteData<PaginationMergerGetPageResult<Transfer>, Error>,
        any[],
        PaginationMergerGetPageParams
    >({
        queryKey,
        queryFn: ({ pageParam }) => getPaginatedTransfersPaginationMerger.getPage(pageSize, pageParam),
        enabled: queryEnabled,
        staleTime: 3000,
        initialPageParam: undefined,
        getNextPageParam: (lastPage) =>
            lastPage.isLastPage
                ? undefined
                : {
                      nextPageParams: lastPage.nextPageParams,
                      rest: lastPage.rest,
                  },
    });
}
