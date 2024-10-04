import { RouteObject } from "react-router-dom";
import { ActivityPage } from "../pages/activity-page";
import { ActivityRoutes } from "./activity-router.types";

/**
 * Get the activity routes.
 * @returns The activity routes.
 */
export const useActivityRoutes = (): RouteObject[] => {
    return [
        {
            path: ActivityRoutes.ACTIVITY,
            element: <ActivityPage />,
        },
    ];
};
