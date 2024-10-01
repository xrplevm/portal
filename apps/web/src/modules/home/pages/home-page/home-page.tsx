import { PropsWithChildren, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { HomeRoutes } from "../../router/home-router.types";
import { BridgeRoutes } from "../../../bridge/bridge.router";
import { ActivityRoutes } from "../../../activity/router/activity-router.types";
import { MainPage } from "../../../common/containers/main-page/main-page";
import { HomeTabs } from "../../navigation/home-tabs/home-tabs";
import HomeCard from "../../surface/home-card/home-card";

const HOME_TABS_ROUTES: string[] = [HomeRoutes.HOME, BridgeRoutes.BRIDGE, ActivityRoutes.ACTIVITY];

const HomePage = ({ children }: PropsWithChildren): JSX.Element => {
    const { pathname } = useLocation();
    const [showHomeTabs, setShowHomeTabs] = useState(HOME_TABS_ROUTES.includes(pathname));

    useEffect(() => {
        if (HOME_TABS_ROUTES.includes(pathname)) setShowHomeTabs(true);
        else setShowHomeTabs(false);
    }, [pathname]);

    return (
        <MainPage>
            {showHomeTabs && <HomeTabs />}
            <HomeCard>{children}</HomeCard>
        </MainPage>
    );
};

export default HomePage;
