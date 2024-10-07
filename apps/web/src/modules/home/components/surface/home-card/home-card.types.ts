import { CSSProperties, ReactNode } from "react";

export interface HomeCardProps {
    /**
     * Main Card Children
     */
    children?: ReactNode;
    /**
     * Main Card style
     */
    style?: CSSProperties;
    /**
     * Main Card className
     */
    className?: string;
}
