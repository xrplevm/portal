import { cx } from "@peersyst/react-utils";
import { HomeCardRoot } from "./home-card.styles";
import { HomeCardProps } from "./home-card.types";

function HomeCard({ children, className, style }: HomeCardProps): JSX.Element {
    return (
        <HomeCardRoot className={cx("HomeCard", className)} style={style}>
            {children}
        </HomeCardRoot>
    );
}

export default HomeCard;
