import { ControllerFactory } from "@frontend/core/domain/controller/factory";

import { SettingsController } from "@frontend/settings/domain/controllers";
import { ISettingsController } from "@frontend/settings/ui/interfaces";
import { StateManager } from "../state/state.manager";
import { RepositoryFactory } from "../../data-access/factories/repository.factory";
import { ServiceFactory } from "../../data-access/factories/service.factory";
import {
    IBridgeChainsController,
    IBridgeTokenController,
    IBridgeTransferController,
    IBridgeWalletsController,
} from "@frontend/bridge/ui/interfaces";
import {
    BridgeChainsController,
    BridgeTokenController,
    BridgeTransferController,
    BridgeWalletsController,
} from "@frontend/bridge/domain/controllers";
import { IChainController } from "@frontend/chain/ui/interfaces";
import { ChainController } from "@frontend/chain/domain/controllers";

declare module "@frontend/core/domain/controller/factory" {
    export interface IControllerFactory {
        settingsController: ISettingsController;
        bridgeChainsController: IBridgeChainsController;
        bridgeTokenController: IBridgeTokenController;
        bridgeWalletsController: IBridgeWalletsController;
        bridgeTransferController: IBridgeTransferController;
        chainController: IChainController;
    }
}

ControllerFactory.create({
    settingsController: () =>
        new SettingsController(RepositoryFactory.settingsRepository, ServiceFactory.localizationService, StateManager.states.settings),
    chainController: () => new ChainController(ServiceFactory.axelarService),
    bridgeChainsController: (resolve) =>
        new BridgeChainsController(resolve.chainController, StateManager.states.bridgeChains, RepositoryFactory.bridgeChainsRepository),
    bridgeTokenController: (resolve) =>
        new BridgeTokenController(ServiceFactory.axelarService, resolve.bridgeChainsController, StateManager.states.bridgeToken),
    bridgeWalletsController: (resolve) =>
        new BridgeWalletsController(
            resolve.bridgeChainsController,
            StateManager.states.bridgeWalletsState,
            RepositoryFactory.bridgeWalletsRepository,
        ),
    bridgeTransferController: (resolve) =>
        new BridgeTransferController(resolve.bridgeTokenController, resolve.bridgeChainsController, resolve.bridgeWalletsController),
});

export { ControllerFactory } from "@frontend/core/domain/controller/factory";
