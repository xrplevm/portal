import { cx } from "@peersyst/react-utils";
import { HomeCardRoot } from "./home-card.styles";
import { HomeCardProps } from "./home-card.types";

function HomeCard({ children, className }: HomeCardProps): JSX.Element {
    return <HomeCardRoot className={cx("HomeCard", className)}>{children}</HomeCardRoot>;
}

export default HomeCard;
