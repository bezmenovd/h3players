import { createClient } from "redis";
import { lobby } from "../services/clickhouse";
import { logger } from "../services/logger";
import { throttle } from "../helpers/functions";
import { datetime } from "../helpers/timestamp";
import { sleep } from "../helpers/sleep";


export async function rankInit(redis: Awaited<ReturnType<typeof createClient>>) {
    let lastTimestamp = 0
    let lastId = 0

    while (true) {
        lastTimestamp = Number(await redis.get('background:rank:init:lastTimestamp'))
        lastTimestamp = Number.isFinite(lastTimestamp) ? lastTimestamp : 0

        let games = await (await lobby().query({
            query: `
                SELECT 
                    id,
                    end_timestamp,
                    host_id,
                    host_new_rating,
                    opponent_id,
                    opponent_new_rating
                FROM games
                WHERE end_timestamp >= {start_timestamp:UInt32}
                ORDER BY end_timestamp ASC
                LIMIT 100
            `,
            query_params: {
                start_timestamp: lastTimestamp,
            },
            format: 'JSONEachRow',
        })).json<{ 
            id: number,
            end_timestamp: number,
            host_id: number,
            host_new_rating: number,
            opponent_id: number,
            opponent_new_rating: number,
        }>()

        if (games.length === 0 || lastId === games[games.length-1].id) {
            logger.info(`rank: done`)
            break
        }

        games.forEach(g => {
            redis.zAdd('rank', { value: String(g.host_id), score: g.host_new_rating })
            redis.zAdd('rank', { value: String(g.opponent_id), score: g.opponent_new_rating })
        })

        lastId = games[games.length-1].id

        logger.info(`rank: init at ${ datetime.from(games[games.length-1].end_timestamp)}`)

        await redis.set('background:rank:init:lastTimestamp', String(games[games.length-1].end_timestamp))

        await sleep(100)
    }
}

export async function rankListen(redis: Awaited<ReturnType<typeof createClient>>, redisSub: Awaited<ReturnType<typeof createClient>>) {
    const update = throttle(async () => {
        let lastTimestamp = 0
        let lastId = 0

        while (true) {
            lastTimestamp = Number(await redis.get('background:rank:init:lastTimestamp'))
            lastTimestamp = Number.isFinite(lastTimestamp) ? lastTimestamp : 0
    
            let games = await (await lobby().query({
                query: `
                    SELECT 
                        id,
                        end_timestamp,
                        host_id,
                        host_new_rating,
                        opponent_id,
                        opponent_new_rating
                    FROM games
                    WHERE end_timestamp >= {start_timestamp:UInt32}
                    ORDER BY end_timestamp ASC
                    LIMIT 100
                `,
                query_params: {
                    start_timestamp: lastTimestamp,
                },
                format: 'JSONEachRow',
            })).json<{ 
                id: number,
                end_timestamp: number,
                host_id: number,
                host_new_rating: number,
                opponent_id: number,
                opponent_new_rating: number,
            }>()

            if (games.length === 0 || lastId === games[games.length-1].id) {
                break
            }
    
            games.forEach(g => {
                redis.zAdd('rank', { value: String(g.host_id), score: g.host_new_rating })
                redis.zAdd('rank', { value: String(g.opponent_id), score: g.opponent_new_rating })
            })

            lastId = games[games.length-1].id

            await redis.set('background:rank:init:lastTimestamp', String(games[games.length-1].end_timestamp))

            await sleep(100)
        }


        logger.info(`rank: updated to ${ datetime.from(lastTimestamp) }`)
    }, 500)

    redisSub.subscribe('live:processor:games', update)
}

