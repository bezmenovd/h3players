import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { logger } from '../helpers/logger';

export type ModerateResult = {
    isValid: boolean
    reason: string
}

export type ModerateAndTranslateResult = {
    isValid: boolean
    reason: string
    translations: {
        lang: number
        value: string
    }[]
}

@Injectable()
export class OpenaiService {
    private openai?: OpenAI;

    async onModuleInit() {
        this.openai = new OpenAI({
            apiKey: `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`,
        });
    }

    async moderate(text: string): Promise<ModerateResult> {
        const prompt = `
            Ты модератор пользовательского контента на сайте
            1. МОДЕРАЦИЯ:
            - isValid: false только за мат, оскорбления, политику, религию, дискриминацию, личные данные или нелегальный контент (РФ/ЕС). 
            - В остальных случаях isValid: true.
            - При isValid: false верни translations: [].

            ВЕРНИ ТОЛЬКО JSON:
            {
                "isValid": boolean,
                "reason": string|null,
            }
        `;
    
        const completion = await this.openai!.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: prompt },
                { role: 'user', content: text },
            ],
            response_format: { type: 'json_object' },
        });

        logger.info(`openai result: ${JSON.stringify({ 
            prompt: prompt.trim(), 
            text, 
            response: JSON.parse(completion.choices[0].message.content!) 
        })}`);

        const result = JSON.parse(completion.choices[0].message.content!) as ModerateResult
    
        return result
    }

    async moderateAndTranslate(text: string, userLanguage: number): Promise<ModerateAndTranslateResult> {
        const prompt = `
            Ты модератор и переводчик пользовательского контента на сайте
            1. МОДЕРАЦИЯ:
            - isValid: false только за мат, оскорбления, политику, религию, дискриминацию, личные данные (за исключением относящихся к игре и игровому сообществу) или нелегальный контент (РФ/ЕС). 
            - В остальных случаях isValid: true.
            - При isValid: false верни translations: [].
            2. ПЕРЕВОД (только если isValid: true):
            - Переведи на языки из списка, ИСКЛЮЧАЯ ID ${userLanguage}:
            1:Русский, 2:Английский, 3:Польский.
            - Требования: похожая структура, сохранение оригинального форматирования и стиля.

            ВЕРНИ ТОЛЬКО JSON:
            {
                "isValid": boolean,
                "reason": string|null,
                "translations": [{"lang": number, "value": "string"}]
            }
        `;
    
        const completion = await this.openai!.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: prompt },
                { role: 'user', content: text },
            ],
            response_format: { type: 'json_object' },
        });

        logger.info(`openai result: ${JSON.stringify({ 
            prompt: prompt.trim(), 
            text, 
            response: JSON.parse(completion.choices[0].message.content!) 
        })}`);

        const result = JSON.parse(completion.choices[0].message.content!) as ModerateAndTranslateResult
    
        return result;
    }
}
