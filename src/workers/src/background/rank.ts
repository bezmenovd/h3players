import { createClient } from "redis";
import { lobby } from "../services/clickhouse";
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
                argMax(player_new_rating, end_timestamp) AS last_rating,
                max(end_timestamp) as last_timestamp
            FROM games_v
            GROUP BY player_id
        `,
        format: 'JSONEachRow',
    })).stream()

    for await (const rows of gamesStream) {
        await Promise.all(rows.map(async (row: Row) => {
            let item = row.json() as { player_id: number, last_rating: number, last_timestamp: number }
            if (item.last_timestamp <= 1703970000) {
                item.last_rating = Math.min(Math.floor(item.last_rating * 0.5), 500)
            }
            if (item.last_timestamp <= 1767213000) {
                item.last_rating = Math.min(Math.floor(item.last_rating * 0.5), 500)
            }

            await Promise.all([
                redis.set(`spectator:last-rating:${item.player_id}`, String(item.last_rating)),
                redis.zAdd('rank', { value: String(item.player_id), score: item.last_rating }),
            ])
        }))
    }

    redis.quit()

    logger.info('rank updated')
}

export async function listen() {
    const redisSub = createClient({
        socket: {
            host: 'redis',
        }
    })

    await redisSub.connect()

    const redis = createClient({
        socket: {
            host: 'redis',
        }
    })

    await redis.connect()

    redisSub.subscribe('live:processor:games_v', async (msg) => {
        let data = JSON.parse(msg) as { player_id: number[] }

        let gamesStream = (await lobby().query({
            query: `
                SELECT 
                    player_id,
                    argMax(player_new_rating, end_timestamp) AS last_rating,
                    max(end_timestamp) as last_timestamp
                FROM games_v
                WHERE player_id in {player_ids:Array(UInt32)}
                GROUP BY player_id
            `,
            query_params: {
                player_ids: data.player_id,
            },
            format: 'JSONEachRow',
        })).stream()
    
        for await (const rows of gamesStream) {
            await Promise.all(rows.map(async (row: Row) => {
                let item = row.json() as { player_id: number, last_rating: number, last_timestamp: number }

                await Promise.all([
                    redis.set(`spectator:last-rating:${item.player_id}`, String(item.last_rating)),
                    redis.zAdd('rank', { value: String(item.player_id), score: item.last_rating }),
                ])
            }))
        }

        logger.info(`rank updated for players ${ data.player_id.join(', ') }`)
    })
}
