import { MiddlewareConsumer, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import configuration from "./config";
import { join } from "path";
import * as OpenApiValidator from "express-openapi-validator";
import { APP_FILTER } from "@nestjs/core";
import { CommandModule } from "nestjs-command/dist/command.module.js";
import { ErrorFilter } from "@backend/core/exceptions";
import { RelayerModule } from "./modules/relayer/relayer.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [async () => configuration()],
            expandVariables: true,
            isGlobal: true,
        }),
        CommandModule,
        RelayerModule,
    ],
    providers: [{ provide: APP_FILTER, useClass: ErrorFilter }],
})
export class AppModule {
    /**
     * Configures the middleware for the application.
     * @param consumer The middleware consumer.
     */
    configure(consumer: MiddlewareConsumer): void {
        consumer
            .apply(
                ...OpenApiValidator.middleware({
                    apiSpec: join("./openapi-spec.json"),
                    validateRequests: {
                        allowUnknownQueryParameters: true,
                        coerceTypes: false,
                    },
                    validateResponses: false,
                    validateFormats: "full",
                }),
            )
            .forRoutes("*");
    }
}
