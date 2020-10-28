import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    private logger: Logger = new Logger('HTTP');

    use(request: Request, response: Response, next: NextFunction) {
        response.on('close', () => {
            this.logger.log(`${request.method} ${request.baseUrl} ${response.statusCode}`)
        });
        next();
    }
}