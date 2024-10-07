import { PropsWithChildren, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { HomeRoutes } from "../../router/home-router.types";
import { BridgeRoutes } from "../../../bridge/bridge.router";
import { ActivityRoutes } from "../../../activity/router/activity-router.types";
import { MainPage } from "../../../common/containers/main-page/main-page";
import { HomeTabs } from "../../components/navigation/home-tabs/home-tabs";
import HomeCard from "../../components/surface/home-card/home-card";

const HOME_TABS_ROUTES: string[] = [HomeRoutes.HOME, BridgeRoutes.BRIDGE, ActivityRoutes.ACTIVITY];

const HomePage = ({ children }: PropsWithChildren): JSX.Element => {
    const { pathname } = useLocation();
    // TODO: Remove on https://www.notion.so/6192badb28394cc1ac40f0a57963d1c4?v=46ea4897bbd648b68da11d55261e72ee&p=8e03e9be02834e3f9a60ec22f11eced6&pm=s
    const [showHomeTabs, setShowHomeTabs] = useState(HOME_TABS_ROUTES.includes(pathname));

    useEffect(() => {
        if (HOME_TABS_ROUTES.includes(pathname)) setShowHomeTabs(true);
        else setShowHomeTabs(false);
    }, [pathname]);

    console.log("showHomeTabs", showHomeTabs);

    return (
        <MainPage>
            <HomeTabs />
            <HomeCard>{children}</HomeCard>
        </MainPage>
    );
};

export default HomePage;
