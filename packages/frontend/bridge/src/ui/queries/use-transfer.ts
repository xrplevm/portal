import { UseExternalMutationOptions } from "@frontend/query/react";
import { useMutation, UseMutationResult, useQueryClient } from "@tanstack/react-query";
import { useConnectedBridgeSourceWalletState } from "../hooks/use-connected-bridge-source-wallet-state";
import { getInstance } from "@frontend/core/common/utils/singleton";
import { BridgeTransferController } from "../../domain/controllers/bride-transfer/bridge-transfer.controller";
import { getChainBridgeTokenBalanceQueryKey } from "./use-get-chain-bridge-token-balance";
import { useBridgeChainsState, useBridgeTokenState } from "../state";
import { BridgeTransferResult } from "../../common/types/bridge-transfer.types";
import { BridgeSource } from "../../common/types/bridge.types";

/**
 * Transfer mutation.
 * @param options The options for mutation.
 * @returns The mutation result.
 */
export function useTransfer(
    options?: UseExternalMutationOptions<BridgeTransferResult, Error, string>,
): UseMutationResult<BridgeTransferResult, Error, string> {
    const originWallet = useConnectedBridgeSourceWalletState(BridgeSource.ORIGIN);
    const destinationWallet = useConnectedBridgeSourceWalletState(BridgeSource.DESTINATION);
    const { originChain, destinationChain } = useBridgeChainsState();
    const bridgeToken = useBridgeTokenState();

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (amount: string) => getInstance(BridgeTransferController).executeTransfer(amount),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries(getChainBridgeTokenBalanceQueryKey(originWallet?.address, originChain?.id, bridgeToken?.id)),
                queryClient.invalidateQueries(
                    getChainBridgeTokenBalanceQueryKey(destinationWallet?.address, destinationChain?.id, bridgeToken?.id),
                ),
            ]);
        },
        ...options,
    });
}
