import { Outlet, RouteObject } from "react-router-dom";
import HomePage from "../pages/home-page/home-page";
import { HomeRoutes } from "./home-router.types";
import { useBridgeRoutes } from "../../bridge/bridge.router";
import { useActivityRoutes } from "../../activity/router/activity-router";
import { lazy } from "react";

const BridgePage = lazy(() => import("../../bridge/page/bridge-page"));

/**
 * Home routes.
 * @returns The home routes.
 */
export const useHomeRoutes = (): RouteObject[] => {
    const bridgeRoutes = useBridgeRoutes();
    const activityRoutes = useActivityRoutes();

    return [
        {
            path: HomeRoutes.HOME,
            element: (
                <HomePage>
                    <Outlet />
                </HomePage>
            ),
            children: [
                {
                    path: HomeRoutes.HOME,
                    element: <BridgePage />,
                },
                ...bridgeRoutes,
                ...activityRoutes,
            ],
        },
    ];
};
