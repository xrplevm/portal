import { ModalProvider } from "@frontend/design-system-react/modal";
import { BrowserRouter, Navigate, useRoutes } from "react-router-dom";
import { ScrollToTop } from "./components/scroll-to-top/scroll-to-top";
import { BridgeRoutes, useBridgeRoutes } from "../modules/bridge/bridge.router";
import { BasePage } from "../modules/common/containers/base-page/base-page";
import { useActivityRoutes } from "../modules/activity/router/activity-router";

function Routes(): JSX.Element | null {
    const activityRoutes = useActivityRoutes();
    const bridgeRoutes = useBridgeRoutes();

    return useRoutes([
        ...activityRoutes,
        ...bridgeRoutes,
        {
            path: "*",
            element: <Navigate to={BridgeRoutes.BRIDGE} />,
        },
    ]);
}

export default function Router(): JSX.Element {
    return (
        <BrowserRouter>
            <ModalProvider>
                <ScrollToTop />
                <BasePage>
                    <Routes />
                </BasePage>
            </ModalProvider>
        </BrowserRouter>
    );
}
