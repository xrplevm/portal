import { IBridgeTokenService } from "@frontend/bridge/domain/interfaces";
import { IChainService } from "@frontend/chain/domain/interfaces";
import { IActivityService } from "@frontend/activity/domain/interfaces";

export interface IAxelarService extends IChainService, IBridgeTokenService, IActivityService {}
