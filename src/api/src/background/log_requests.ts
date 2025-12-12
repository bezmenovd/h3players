import { createClient as createClientRedis } from 'redis'
import { createClient } from '@clickhouse/client';
import { sleep } from '../helpers/sleep';
import { Request } from '../types/clickhouse/internal';
import { timestamp } from '../helpers/timestamp';


export async function logRequests() {
    const redis = createClientRedis({
        socket: {
            host: 'redis',
        }
    })

    await redis.connect()

    const clickhouse = createClient({
        url: 'http://clickhouse:8123',
        username: 'default',
        password: 'xQm8LpsLOolVLryE',
        database: 'internal',
    })

    let batch: Request[] = []
    let lastInsert = timestamp.now()

    while (true) {
        let request = await redis.lPop('api:requests')

        if (request) {
            batch.push(JSON.parse(request) as Request)
        }

        if (batch.length >= 50 || lastInsert + 1 <= timestamp.now()) {
            await clickhouse.insert({
                table: `requests`,
                values: batch,
                format: 'JSONEachRow',
            })

            batch = []
            lastInsert = timestamp.now()
        }

        await sleep(100)
        continue
    }
}
