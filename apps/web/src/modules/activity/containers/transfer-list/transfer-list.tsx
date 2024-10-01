import { TransferListNothingToShow } from "../transfer-list-nothing-to-show/transfer-list-nothing-to-show";
import { TransferInfiniteList, TransferListRoot } from "./transfer-list.styles";
import { useRef } from "react";
import { setRef } from "@peersyst/react-utils";
import { Transfer } from "../../components/display/transfer/transfer";
import { useGetPaginatedTransfers, usePaginatedTransfersEnabled } from "@frontend/activity/ui/queries";

export const TransferList = (): JSX.Element => {
    const paginatedTransfersEnabled = usePaginatedTransfersEnabled();
    const { data, isLoading, isFetching, fetchNextPage, hasNextPage } = useGetPaginatedTransfers();

    const rootRef = useRef();

    const loading = isLoading || isFetching;

    const handleEndReached = () => {
        if (paginatedTransfersEnabled && hasNextPage) fetchNextPage({ cancelRefetch: false });
    };

    return (
        <TransferListRoot ref={(r) => setRef(rootRef, r)} isEmpty={data?.pages[0].items.length === 0 && !loading}>
            <TransferInfiniteList
                container={rootRef as any} // Ref types conflict
                data={data}
                isLoading={loading}
                end={!hasNextPage}
                onEndReached={handleEndReached}
                renderItem={(transfer) => <Transfer transfer={transfer} />}
                nothingToShow={<TransferListNothingToShow />}
                observerOffset="5rem"
            />
        </TransferListRoot>
    );
};
