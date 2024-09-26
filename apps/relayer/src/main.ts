import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import morgan from "morgan";
import { utilities as nestWinstonModuleUtilities, WinstonModule } from "nest-winston";
import * as winston from "winston";
import { AppModule } from "./app.module";
import * as packageJson from "../package.json";
import { ConfigService } from "@nestjs/config";

/**
 * Bootstraps the application.
 */
async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const logLevel = configService.get("logger.logLevel");
    const logFileName = configService.get("logger.logFile");
    const serverPort = configService.get("server.port");

    const logger = WinstonModule.createLogger({
        transports: [
            new winston.transports.Console({
                format: winston.format.combine(winston.format.timestamp(), nestWinstonModuleUtilities.format.nestLike()),
            }),
            new winston.transports.File({
                format: winston.format.combine(winston.format.timestamp(), nestWinstonModuleUtilities.format.nestLike()),
                level: logLevel,
                filename: logFileName,
            }),
        ],
    });

    app.useLogger(logger);
    app.use(helmet());
    app.use(morgan("tiny"));
    app.setGlobalPrefix("api");

    if (configService.get("server.enableCors")) {
        app.enableCors();
    }
    const options = new DocumentBuilder()
        .setTitle(packageJson.name)
        .setDescription(packageJson.description)
        .setVersion(packageJson.version)
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, options, { operationIdFactory: (_m, method) => method });

    if (configService.get("server.enableSwagger")) {
        SwaggerModule.setup("swagger", app, document);
    }

    await app.listen(serverPort);
    logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
