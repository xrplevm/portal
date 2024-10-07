import { TabsProps } from "@frontend/design-system-react/tabs";

export interface RouterTabsProps extends Omit<TabsProps, "index" | "onIndexChange" | "initialIndex"> {}
