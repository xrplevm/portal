import { Row } from "@frontend/design-system-react/row";
import { TransferTokenProps } from "./transfer-token.types";
import { NativeChainAvatar, TransferTokenAvatar } from "./transfer-token.styles";
import clsx from "clsx";
import { token_default_logo } from "@frontend/design-system-react/assets/images";

export function TransferToken({ tokenImageUrl = "", nativeChainImageUrl = "", className, ...restProps }: TransferTokenProps): JSX.Element {
    return (
        <Row className={clsx("TransferToken", className)} css={{ position: "relative", display: "inline-block" }} {...restProps}>
            <TransferTokenAvatar className="TransferTokenAvatar" src={tokenImageUrl} fallback={token_default_logo} alt="token-logo" />
            <NativeChainAvatar className="NativeChainAvatar" src={nativeChainImageUrl} alt="chain-logo" />
        </Row>
    );
}
