import { useInfiniteQuery, UseInfiniteQueryResult } from "@tanstack/react-query";
import { getInstance } from "@frontend/core/common/utils/singleton";
import { ActivityController } from "../../domain/controllers";
import { useBridgeChainsState, useBridgeWalletsState } from "@frontend/bridge/ui/state";

// TODO: https://www.notion.so/Axelar-Transfer-tokens-from-XRPL-b5610ee16a82430eba9bbd7789c74642?pvs=4
export interface UseGetPaginatedTransfersProps {
    page: number;
    pageSize: number;
}

/**
 * Get the query key for the paginated transfers query.
 * @returns The query key.
 */
export function getPaginatedTransfersQueryKey(): any {
    return ["paginated-transfers"];
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
export function useGetPaginatedTransfers(_: UseGetPaginatedTransfersProps = { page: 1, pageSize: 10 }): UseInfiniteQueryResult<any, Error> {
    // const _bridgeChainsState = useBridgeChainsState();
    // const _bridgeWalletsState = useBridgeWalletsState();

    const queryEnabled = usePaginatedTransfersEnabled();
    const queryKey = getPaginatedTransfersQueryKey();

    // TODO: Define getPaginatedTransfers params
    return useInfiniteQuery({
        queryKey,
        queryFn: () => getInstance(ActivityController).getPaginatedTransfers(),
        enabled: queryEnabled,
        staleTime: 3000,
        // TODO: Set pagination (https://www.notion.so/Axelar-Transfer-tokens-from-XRPL-b5610ee16a82430eba9bbd7789c74642?pvs=4)
        getNextPageParam: (lastPage) => lastPage.page + 1,
        initialPageParam: 1,
    });
}
