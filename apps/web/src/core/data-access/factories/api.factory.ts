import { ApiFactory } from "@frontend/core/data-access/api/factory";

declare module "@frontend/core/data-access/api/factory" {
    export interface IApiFactory {}
}

ApiFactory.create({});

export { ApiFactory } from "@frontend/core/data-access/api/factory";
