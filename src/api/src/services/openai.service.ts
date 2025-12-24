import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { logger } from '../helpers/logger';
import { ProxyAgent } from 'undici';

export type ModerateResult = {
    isValid: boolean
    reason: string
}

export type TranslateResult = string

const proxyAgent = new ProxyAgent('http://SdaNWnab9SzVNCt3:ifJQL8vluEOeyCgV@geo.iproyal.com:12321');

@Injectable()
export class OpenaiService {
    private openai?: OpenAI;

    async onModuleInit() {
        this.openai = new OpenAI({
            apiKey: `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`,
            fetch: (async (url: any, init: any) => {
                return fetch(url, { 
                    ...init,
                    dispatcher: proxyAgent 
                } as any);
            }) as any,
        });
    }

    async moderate(text: string): Promise<ModerateResult> {
        const moderation = await this.openai!.moderations.create({ input: text });
        const [result] = moderation.results;

        if (result.flagged) {
            const categories = Object.entries(result.categories)
                .filter(([_, value]) => value)
                .map(([key]) => key)
                .join(', ');

            return {
                isValid: false,
                reason: `${categories}`
            };
        }

        const prompt = `
            Ты модератор пользовательского контента на сайте
            ВЕРНИ ТОЛЬКО JSON:
            {
                "isValid": boolean, // false только за мат, оскорбления, политику, религию, дискриминацию, личные данные или нелегальный контент (РФ/ЕС), а также любой непристойный или шокирующий контент (за исключением общепринятого игрового сленга). 
                "reason": string|null, // причина если isValid false
            }
        `;
    
        const completion = await this.openai!.chat.completions.create({
            model: 'gpt-5-mini',
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

        const result2 = JSON.parse(completion.choices[0].message.content!) as ModerateResult

        if (! result2.isValid) {
            result2.reason = result2.reason.toLowerCase()
        }
    
        return result2
    }

    async translate(text: string, language: number): Promise<TranslateResult> {
        const languageName = { 1: 'русский', 2: 'английский', 3: 'польский'}[language] ?? null

        if (! languageName) {
            throw new Error('unknown language: ' + language)
        }

        const prompt = `
            Переведи весь текст, полностью, сохраняя структуру, оригинальное форматирование и стиль, на ${languageName} язык
        `;

        const completion = await this.openai!.chat.completions.create({
            model: 'gpt-5-mini',
            messages: [
                { role: 'system', content: prompt },
                { role: 'user', content: text },
            ],
        });

        logger.info(`openai result: ${JSON.stringify({ 
            prompt: prompt.trim(), 
            text, 
            response: completion.choices[0].message.content!
        })}`);

        const result = completion.choices[0].message.content! as TranslateResult
    
        return result;
    }
}
