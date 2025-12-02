import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { tap } from "rxjs";
import { logger } from "../helpers/logger";

@Injectable()
export class TimingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler) {const start = Date.now();
        const req = context.switchToHttp().getRequest();
        const { method, route } = req;
        const path = route?.path ?? req.url;
    
        return next.handle().pipe(
            tap(() => {
                const duration = Date.now() - start;
                logger.info(`${method} ${path} — ${duration}ms`);
            })
        );
    }
}
