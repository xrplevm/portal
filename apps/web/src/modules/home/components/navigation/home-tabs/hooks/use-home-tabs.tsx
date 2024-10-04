import { useMemo } from "react";
import { HomeTab } from "../home-tabs.types";
import { useTranslate } from "@frontend/locale/react";
import { BridgeRoutes } from "../../../../../bridge/bridge.router";
import { ActivityRoutes } from "../../../../../activity/router/activity-router.types";

/**
 * Get the home tabs.
 * @returns The home tabs.
 */
export function useHomeTabs(): HomeTab[] {
    const translate = useTranslate();

    return useMemo(
        () => [
            {
                path: BridgeRoutes.BRIDGE,
                label: translate("bridge"),
            },
            {
                path: ActivityRoutes.ACTIVITY,
                label: translate("activity"),
            },
        ],
        [translate],
    );
}
