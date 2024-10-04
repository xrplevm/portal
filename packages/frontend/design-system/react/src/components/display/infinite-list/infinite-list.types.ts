import { PaginatedData } from "@frontend/misc/pagination";
import { DataLoaderProps, ListProps } from "../list/list.types";
import { InfiniteScrollProps as BaseInfiniteScrollProps } from "@peersyst/react-components";
import { ReactElement } from "react";

export type EnhancedInfiniteScrollProps = {
    onEndReached: BaseInfiniteScrollProps["callback"];
    end?: BaseInfiniteScrollProps["end"];
} & Omit<BaseInfiniteScrollProps, "callback" | "children" | "loading" | "end" | "loaderElement">;

export type InfiniteScrollDataProps<E> = {
    data: E[] | undefined;
    children?: ((item: E, index: number) => ReactElement) | ReactElement;
    renderItem?: (item: E, index: number) => ReactElement;
} & EnhancedInfiniteScrollProps &
    DataLoaderProps;

export type OmittedDataListProps<E> = Pick<ListProps<PaginatedData<E[]>>, "className" | "style" | "gap">;

export interface InfiniteListProps<E> extends OmittedDataListProps<E>, InfiniteScrollDataProps<E> {}
