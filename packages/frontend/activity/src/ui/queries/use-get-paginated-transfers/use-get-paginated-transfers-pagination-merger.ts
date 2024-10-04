import { useMemo } from "react";
import { PaginationMerger, PaginationMergerItem } from "../../../../../../shared/utils/src";
import { Transfer } from "../../../common";
import { getInstance } from "@frontend/core/common/utils/singleton";
import { ActivityController } from "../../../domain/controllers";

export type UseGetPaginatedTransfersPaginationMergerProps = {
    sourceChainId?: string;
    destinationChainId?: string;
    sourceWalletAddress?: string;
    pageSize?: number;
};

/**
 * Get paginated transfers pagination merger.
 * @param options The options.
 * @returns The pagination merger.
 */
export function useGetPaginatedTransfersPaginationMerger({
    sourceChainId,
    destinationChainId,
    sourceWalletAddress,
    pageSize = 10,
}: UseGetPaginatedTransfersPaginationMergerProps): PaginationMerger<Transfer> {
    return useMemo(
        () =>
            new PaginationMerger<Transfer>(
                [
                    new PaginationMergerItem<Transfer>({
                        initialPageParams: 1,
                        getPage: async ({ pageParam = 1 }) => {
                            const { items, currentPage, pages } = await getInstance(ActivityController).getPaginatedTransfers(
                                pageParam,
                                pageSize,
                                sourceChainId,
                                destinationChainId,
                                sourceWalletAddress,
                            );

                            return {
                                items,
                                nextPageParams: pageParam + 1,
                                isLastPage: currentPage >= pages,
                            };
                        },
                        parseItem: (item) => item,
                    }),
                    new PaginationMergerItem<Transfer>({
                        initialPageParams: 1,
                        getPage: async ({ pageParam = 1 }) => {
                            const { items, currentPage, pages } = await getInstance(ActivityController).getPaginatedTransfers(
                                pageParam,
                                pageSize,
                                destinationChainId,
                                sourceChainId,
                            );

                            return {
                                items,
                                nextPageParams: pageParam + 1,
                                isLastPage: currentPage >= pages,
                            };
                        },
                        parseItem: (item) => item,
                    }),
                ],
                {
                    compare: (a: Transfer, b: Transfer) => a.createdAt > b.createdAt,
                },
            ),
        [sourceChainId, destinationChainId, sourceWalletAddress, pageSize],
    );
}
