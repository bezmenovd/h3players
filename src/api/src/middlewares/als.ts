import { Injectable, NestMiddleware } from '@nestjs/common';
import { als } from '../als';

@Injectable()
export class AlsMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void) {
        const language = req.headers['language'] ? Number(req.headers['language']) : 2;
        const token = req.headers['token'] || '';
        
        als.run({ language, token }, () => {
            next();
        });
    }
}
