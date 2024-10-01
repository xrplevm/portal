import { Outlet, RouteObject } from "react-router-dom";
import { lazy } from "react";

const BridgePage = lazy(() => import("./page/bridge-page"));
const SuccessBridgePage = lazy(() => import("./page/success-bridge-page"));

export enum BridgeRoutes {
    BRIDGE = "/bridge",
    BRIDGE_SUCCESS = "/bridge/success",
}

/**
 * Returns the bridge routes.
 * @returns The bridge routes.
 */
export const useBridgeRoutes = (): RouteObject[] => {
    return [
        {
            path: BridgeRoutes.BRIDGE,
            element: <Outlet />,
            children: [
                {
                    path: BridgeRoutes.BRIDGE,
                    element: <BridgePage />,
                },
                {
                    path: BridgeRoutes.BRIDGE_SUCCESS,
                    element: <SuccessBridgePage />,
                },
            ],
        },
    ];
};
