import { ActivityRoutes } from "../../../activity/router/activity-router.types";
import { BridgeRoutes } from "../../../bridge/bridge.router";
import { HomeRoutes } from "../../router/home-router.types";

export interface HomeTab {
    path: HomeRoutes | BridgeRoutes | ActivityRoutes;
    label: string;
}
