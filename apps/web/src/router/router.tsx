import { ModalProvider } from "@frontend/design-system-react/modal";
import { BrowserRouter, Navigate, useRoutes } from "react-router-dom";
import { ScrollToTop } from "./components/scroll-to-top/scroll-to-top";
import { BridgeRoutes } from "../modules/bridge/bridge.router";
import { BasePage } from "../modules/common/containers/base-page/base-page";
import { useHomeRoutes } from "../modules/home/router/home-router";

function Routes(): JSX.Element | null {
    const homeRoutes = useHomeRoutes();
    return useRoutes([
        ...homeRoutes,
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
