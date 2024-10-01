import { Row, Typography } from "@peersyst/react-components";
import { ImageSelectItemProps } from "./image-select-item.types";
import { SelectItemImage } from "./image-select-item.styles";

export function ImageSelectItem({ src, alt, label, style = {}, className }: ImageSelectItemProps): JSX.Element {
    return (
        <Row flex={1} style={{ overflow: "hidden", ...style }} gap="0.5rem" alignItems="center" className={className}>
            <SelectItemImage src={src || ""} alt={alt || `${label} logo`} />
            {typeof label === "string" ? (
                <Typography style={{ flex: 1, textOverflow: "ellipsis" }} variant="body2Regular">
                    {label}
                </Typography>
            ) : (
                <Row flex={1} style={{ overflow: "hidden", maxWidth: "80%" }}>
                    {label}
                </Row>
            )}
        </Row>
    );
}
