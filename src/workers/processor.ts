import { logger } from './src/services/logger'
import { createClient } from 'redis'
import { sleep } from './src/helpers/sleep'
import { GameModel, GameVModel, PlayerModel, TemplateModel } from './src/models/lobby'
import { timestamp } from './src/helpers/timestamp'
import { lobby } from './src/services/clickhouse'


async function main() {-
    logger.info('starting..')

    const redis = createClient({
        socket: {
            host: 'redis',
        }
    })

    await redis.connect()

    const redisPub = createClient({
        socket: {
            host: 'redis',
        }
    })

    await redisPub.connect()


    const gamesWorker = async () => {
        let batch: GameModel[] = []
        let lastInsert = timestamp.now()

        while (true) {
            let event = await redis.lPop('processor:games')

            if (event) {
                let game = JSON.parse(event) as GameModel
    
                if (! batch.find(g => g.id === game.id)) {
                    batch.push(game)
                }
            }

            if (batch.length >= 30 || lastInsert + 1 <= timestamp.now()) {
                let games_existing = await (await lobby().query({
                    query: `
                        SELECT id
                        FROM games
                        WHERE id in {ids:Array(UInt32)}
                    `,
                    query_params: {
                        ids: batch.map(g => g.id),
                    },
                    format: 'JSONEachRow',
                })).json<{ id: number }>()
    
                let games_existing_set = new Set(games_existing.map(g => g.id))

                let games_to_insert = batch.filter(g => ! games_existing_set.has(g.id))

                if (games_to_insert.length > 0) {
                    await lobby().insert({
                        table: `games`,
                        values: games_to_insert,
                        format: 'JSONEachRow',
                    })

                    logger.info(`${games_to_insert.length} games [${games_to_insert.map(g => g.id).join(',')}]`)

                    redisPub.publish('live:processor:games', '')
                }

                batch = []
                lastInsert = timestamp.now()
            }

            await sleep(100)
            continue
        }
    }

    setImmediate(gamesWorker)
    setInterval(async () => {
        await lobby().exec({ query: `OPTIMIZE TABLE games FINAL DEDUPLICATE BY id` });
    }, 3600_000)


    const gamesVWorker = async () => {
        let batch: GameVModel[] = []
        let lastInsert = timestamp.now()

        while (true) {
            let event = await redis.lPop('processor:games_v')
            if (event) {
                let game_v = JSON.parse(event) as GameVModel
    
                if (! batch.find(g => g.game_id === game_v.game_id && g.player_id === game_v.player_id)) {
                    batch.push(game_v)
                }
            }

            if (batch.length >= 30 || lastInsert + 1 <= timestamp.now()) {
                let games_v_existing = await (await lobby().query({
                    query: `
                        SELECT player_id, opponent_id
                        FROM games_v
                        WHERE game_id in {ids:Array(UInt32)}
                    `,
                    query_params: {
                        ids: batch.map(g => g.game_id),
                    },
                    format: 'JSONEachRow',
                })).json<{ player_id: number, opponent_id: number }>()
    
                let games_v_existing_set = new Set(games_v_existing.map(g => `${g.player_id}:${g.opponent_id}`))

                let games_v_to_insert = batch.filter(g => ! games_v_existing_set.has(`${g.player_id}:${g.opponent_id}`))

                if (games_v_to_insert.length > 0) {
                    await lobby().insert({
                        table: `games_v`,
                        values: games_v_to_insert,
                        format: 'JSONEachRow',
                    })

                    logger.info(`${games_v_to_insert.length} games_v [${games_v_to_insert.map(g => g.game_id).join(',')}]`)

                    redisPub.publish('live:processor:games_v', JSON.stringify({
                        player_id: [...new Set(games_v_to_insert.map(g => g.player_id))],
                    }))
                }

                batch = []
                lastInsert = timestamp.now()
            }
    
            await sleep(100)
            continue
        }
    }

    setImmediate(gamesVWorker)
    setInterval(async () => {
        await lobby().exec({ query: `OPTIMIZE TABLE games_v FINAL DEDUPLICATE BY game_id, player_id` });
    }, 3600_000)


    const playersWorker = async () => {
        let batch: PlayerModel[] = []
        let lastInsert = timestamp.now()

        while (true) {
            let event = await redis.lPop('processor:players')

            if (event) {
                let player = JSON.parse(event) as PlayerModel
    
                if (! batch.find(p => p.id === player.id)) {
                    batch.push(player)
                }
            }

            if (batch.length >= 30 || lastInsert + 1 <= timestamp.now()) {
                let players_existing = await (await lobby().query({
                    query: `
                        SELECT id
                        FROM players
                        WHERE id in {ids:Array(UInt32)}
                    `,
                    query_params: {
                        ids: batch.map(p => p.id),
                    },
                    format: 'JSONEachRow',
                })).json<{ id: number }>()
    
                let players_existing_set = new Set(players_existing.map(p => p.id))

                let players_to_insert = batch.filter(p => ! players_existing_set.has(p.id))

                if (players_to_insert.length > 0) {
                    await lobby().insert({
                        table: `players`,
                        values: players_to_insert,
                        format: 'JSONEachRow',
                    })

                    logger.info(`${players_to_insert.length} players [${players_to_insert.map(p => p.id).join(',')}]`)

                    await lobby().exec({ query: `SYSTEM RELOAD DICTIONARY lobby.players_dictionary` });

                    redisPub.publish('live:processor:players', JSON.stringify({ 
                        id: players_to_insert.map(p => p.id) 
                    }))
                }

                batch = []
                lastInsert = timestamp.now()
            }

            await sleep(100)
            continue
        }
    }

    setImmediate(playersWorker)
    setInterval(async () => {
        await lobby().exec({ query: `OPTIMIZE TABLE players FINAL DEDUPLICATE BY id` });
    }, 600_000)


    const templatesWorker = async () => {
        let batch: TemplateModel[] = []
        let lastInsert = timestamp.now()

        while (true) {
            let event = await redis.lPop('processor:templates')

            if (event) {
                let template = JSON.parse(event) as TemplateModel
    
                if (! batch.find(t => t.id === template.id)) {
                    batch.push(template)
                }
            }

            if (batch.length >= 30 || lastInsert + 1 <= timestamp.now()) {
                let templates_existing = await (await lobby().query({
                    query: `
                        SELECT id
                        FROM templates
                        WHERE id in {ids:Array(UInt32)}
                    `,
                    query_params: {
                        ids: batch.map(t => t.id),
                    },
                    format: 'JSONEachRow',
                })).json<{ id: number }>()
    
                let templates_existing_set = new Set(templates_existing.map(p => p.id))

                let templates_to_insert = batch.filter(p => ! templates_existing_set.has(p.id))

                if (templates_to_insert.length > 0) {
                    await lobby().insert({
                        table: `templates`,
                        values: templates_to_insert,
                        format: 'JSONEachRow',
                    })

                    logger.info(`${templates_to_insert.length} templates [${templates_to_insert.map(t => t.id).join(',')}]`)

                    await lobby().exec({ query: `SYSTEM RELOAD DICTIONARY lobby.templates_dictionary` });

                    redisPub.publish('live:processor:templates', JSON.stringify({ 
                        id: templates_to_insert.map(t => t.id) 
                    }))
                }

                batch = []
                lastInsert = timestamp.now()
            }

            await sleep(100)
            continue
        }
    }

    setImmediate(templatesWorker)
    setInterval(async () => {
        await lobby().exec({ query: `OPTIMIZE TABLE templates FINAL DEDUPLICATE BY id` });
    }, 600_000)
}

main()
