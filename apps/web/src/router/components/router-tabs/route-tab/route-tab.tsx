import { RouteTabProps } from "./route-tab.types";
import { Tab, useSetTab } from "@frontend/design-system-react/tabs";
import { useEffect } from "react";
import { Link, useLocation, matchPath } from "react-router-dom";

export const RouteTab = ({ to, index, children, ...restTabProps }: RouteTabProps): JSX.Element => {
    const { pathname } = useLocation();

    const setTab = useSetTab();

    useEffect(() => {
        if (matchPath({ path: to, caseSensitive: true }, pathname) || pathname.includes(to)) setTab(index);
    }, [pathname]);

    return (
        <Link type="router" to={to}>
            <Tab index={index} {...restTabProps}>
                {children}
            </Tab>
        </Link>
    );
};
