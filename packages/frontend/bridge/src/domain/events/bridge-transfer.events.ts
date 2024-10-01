import { EventEmitter } from "@frontend/events";
import { BridgeTransferEvents } from "../../ui/interfaces/i-bridge-transfer.controller";

export class BridgeTransferEventEmitter extends EventEmitter<BridgeTransferEvents> {}
