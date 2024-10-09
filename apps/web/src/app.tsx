// Load polyfills
import "./polyfills";

// Set up data access
import "./core/data-access/setup";

// Set up domain
import "./core/domain/setup";

// Set up wallet module
import "./modules/wallet/setup";

// Load locale
import "./locale";

// Load design system fonts
import "@frontend/design-system-react/styles/fonts";

import Providers from "./providers";
import { useInit } from "./modules/common/hooks/use-init";
import { Suspense } from "react";
import Router from "./router/router";

export default function App(): JSX.Element | null {
    const { isLoading } = useInit();

    return isLoading ? (
        <></>
    ) : (
        <Suspense fallback={<></>}>
            <Providers>
                <Router />
            </Providers>
        </Suspense>
    );
}
