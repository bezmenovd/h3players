import { createClient } from "redis";
import { lobby } from "../services/clickhouse";
import { throttle } from "../helpers/functions";
import { Row } from "@clickhouse/client";
import { logger } from "../services/logger";


export async function update() {
    const redis = createClient({
        socket: {
            host: 'redis',
        }
    })

    await redis.connect()

    let gamesStream = (await lobby().query({
        query: `
            SELECT 
                player_id,
                argMax(player_new_rating, end_timestamp) AS last_rating
            FROM games_v
            GROUP BY player_id
        `,
        format: 'JSONEachRow',
    })).stream()

    for await (const rows of gamesStream) {
        await Promise.all(rows.map(async (row: Row) => {
            let item = row.json() as { player_id: number, last_rating: number }
            return redis.zAdd('rank', { value: String(item.player_id), score: item.last_rating })
        }))
    }

    redis.quit()

    logger.info('rank updated')
}

export async function listen() {
    const updateThrottled = throttle(update, 10000)

    const redisSub = createClient({
        socket: {
            host: 'redis',
        }
    })

    await redisSub.connect()

    redisSub.subscribe('live:processor:games', () => updateThrottled())
}

