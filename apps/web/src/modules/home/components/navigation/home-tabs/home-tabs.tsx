import { useHomeTabs } from "./hooks/use-home-tabs";
import { HomeTabsRoot } from "./home-tabs.styles";
import { RouteTab } from "../../../../../router/components/router-tabs/route-tab/route-tab";
import { TabGroup } from "@frontend/design-system-react/tabs";

export const HomeTabs = (): JSX.Element => {
    const tabs = useHomeTabs();

    return (
        <HomeTabsRoot>
            <TabGroup>
                {tabs.map((item, index) => (
                    <RouteTab to={item.path} index={index} key={item.label}>
                        {item.label}
                    </RouteTab>
                ))}
            </TabGroup>
        </HomeTabsRoot>
    );
};
