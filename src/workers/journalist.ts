import { Client } from './src/client'
import { logger } from './src/services/logger'
import { Supervisor } from './src/supervisor'
import { sendMessage } from './src/services/telegram'
import { Postman } from './src/postman'
import { createClient } from 'redis'
import { sleep } from './src/helpers/sleep'
import { lobby } from './src/services/clickhouse'
import { Game, GameType, GameStatus, History, Players, Templates } from './src/types/msgin'
import { HistoryAgent } from './src/agents/history'
import { GameModel, GameVModel, PlayerModel, TemplateModel } from './src/models/lobby'
import config from './config'
import { gameIsValid } from './src/types/validate'
import { PlayersAgent } from './src/agents/players'
import { TemplatesAgent } from './src/agents/templates'
import { initWorker } from './src/worker'


async function main() {
    logger.info('starting..')

    initWorker()

    const USER = String(process.env.USER)
    const LAST_ONLY_MODE = String(process.env.LAST_ONLY_MODE) === 'true'

    const redis = createClient({
        socket: {
            host: 'redis',
        }
    })

    await redis.connect()

    const client = new Client('journalist', USER)
    const postman = new Postman(client)
    
    const supervisor = new Supervisor()
    supervisor.addClient(client)
    
    await client.connect()

    let historyAgent = new HistoryAgent(postman)
    let playersAgent = new PlayersAgent(postman)
    let templatesAgent = new TemplatesAgent(postman)

    while (true) {
        if (! client.isConnected()) {
            logger.info('is not connected, sleeping')
            await sleep(10_000)
            continue
        }

        let event = await redis.lPop('events:spectator:player-updated')
        if (! event) {
            await sleep(200)
            continue
        }

        await sleep(200)

        let { playerId } = JSON.parse(event)

        let newGames: Game[] = []

        let game_v_last_row = await (await lobby().query({
            query: `
                SELECT game_id
                FROM games_v
                WHERE player_id = {playerId:UInt32}
                ORDER BY game_id DESC
                LIMIT 1
            `,
            query_params: {
                playerId
            },
            format: 'JSONEachRow',
        })).json<{ game_id: number }>()

        let lastExistingGameId = game_v_last_row.length === 1 ? game_v_last_row[0].game_id : 0
        let beforeTimestamp: number|undefined = undefined
        let total = 0
        let read = 0

        while (true) {
            if (beforeTimestamp) {
                await sleep(800)
            }

            let history: History

            try {
                history = await historyAgent.get(playerId, beforeTimestamp)
            } catch (e: any) {
                sendMessage(`player#${playerId}: ${e.message}`)
                break
            }

            history = history!

            for (let i = 0; i < history.games.length; i++) {
                if (lastExistingGameId >= history.games[i].id) {
                    break
                }
                if (history.games[i].status === GameStatus.NotFinished) {
                    continue
                }

                if (! gameIsValid(history.games[i])) {
                    sendMessage(`player#${playerId}: invalid game: ${JSON.stringify(history.games[i])}`)
                    continue
                }

                newGames.push(history.games[i])
            }

            if (! beforeTimestamp) {
                total = history.total
            }

            read += history.onPage

            if (LAST_ONLY_MODE) break
            if (history.onPage < 20) break
            if (read >= total) break
            if (lastExistingGameId >= history.games[19].id) break

            beforeTimestamp = history.games[19].endTimestamp - 1
        }


        let games_existing = await (await lobby().query({
            query: `
                SELECT id
                FROM games
                WHERE id in {ids:Array(UInt32)}
            `,
            query_params: {
                ids: newGames.map(g => g.id),
            },
            format: 'JSONEachRow',
        })).json<{ id: number }>()

        let games_existing_set = new Set(games_existing.map(g => g.id))

        let games_v_existing = await (await lobby().query({
            query: `
                SELECT player_id, opponent_id
                FROM games_v
                WHERE game_id in {ids:Array(UInt32)}
            `,
            query_params: {
                ids: newGames.map(g => g.id),
            },
            format: 'JSONEachRow',
        })).json<{ player_id: number, opponent_id: number }>()

        let games_v_existing_set = new Set(games_v_existing.map(g => `${g.player_id}:${g.opponent_id}`))


        let games_to_insert: GameModel[] = []
        let games_v_to_insert: GameVModel[] = []

        newGames.forEach(game => {
            if (! games_existing_set.has(game.id)) {
                games_to_insert.push({
                    id: game.id,
                    template_id: game.templateId,
                    game_type: game.type(),
                    size: game.size,
                    levels: game.levels,
                    status: game.status,
                    restarts: game.restarts,
                    end_day: game.endDay,
                    start_timestamp: game.startTimestamp * 60 + config.variables.baseTimestamp,
                    end_timestamp: game.endTimestamp * 60 + config.variables.baseTimestamp,
                    host_id: game.hostId,
                    host_color: game.hostColor,
                    host_town: game.hostTown,
                    host_hero: game.hostHero,
                    host_old_rating: game.hostOldRating,
                    host_new_rating: game.hostNewRating,
                    opponent_id: game.opponentId,
                    opponent_color: game.opponentColor,
                    opponent_town: game.opponentTown,
                    opponent_hero: game.opponentHero,
                    opponent_old_rating: game.opponentOldRating,
                    opponent_new_rating: game.opponentNewRating,
                })
            }

            if (! games_v_existing_set.has(`${game.hostId}:${game.opponentId}`)) {
                games_v_to_insert.push({
                    player_id: game.hostId,
                    game_id: game.id,
                    template_id: game.templateId,
                    is_random: game.type() === GameType.RandomMap,
                    size: game.size,
                    levels: game.levels,
                    is_win: game.status === GameStatus.HostWon,
                    is_draw: game.status === GameStatus.Draw,
                    is_loss: game.status === GameStatus.OpponentWon,
                    restarts: game.restarts,
                    end_day: game.endDay,
                    start_timestamp: game.startTimestamp * 60 + config.variables.baseTimestamp,
                    end_timestamp: game.endTimestamp * 60 + config.variables.baseTimestamp,
                    player_color: game.hostColor,
                    player_town: game.hostTown,
                    player_hero: game.hostHero,
                    player_old_rating: game.hostOldRating,
                    player_new_rating: game.hostNewRating,
                    opponent_id: game.opponentId,
                    opponent_color: game.opponentColor,
                    opponent_town: game.opponentTown,
                    opponent_hero: game.opponentHero,
                    opponent_old_rating: game.opponentOldRating,
                    opponent_new_rating: game.opponentNewRating,
                })
            }
            
            if (! games_v_existing_set.has(`${game.opponentId}:${game.hostId}`)) {
                games_v_to_insert.push({
                    player_id: game.opponentId,
                    game_id: game.id,
                    template_id: game.templateId,
                    is_random: game.type() === GameType.RandomMap,
                    size: game.size,
                    levels: game.levels,
                    is_win: game.status === GameStatus.OpponentWon,
                    is_draw: game.status === GameStatus.Draw,
                    is_loss: game.status === GameStatus.HostWon,
                    restarts: game.restarts,
                    end_day: game.endDay,
                    start_timestamp: game.startTimestamp * 60 + config.variables.baseTimestamp,
                    end_timestamp: game.endTimestamp * 60 + config.variables.baseTimestamp,
                    player_color: game.opponentColor,
                    player_town: game.opponentTown,
                    player_hero: game.opponentHero,
                    player_old_rating: game.opponentOldRating,
                    player_new_rating: game.opponentNewRating,
                    opponent_id: game.hostId,
                    opponent_color: game.hostColor,
                    opponent_town: game.hostTown,
                    opponent_hero: game.hostHero,
                    opponent_old_rating: game.hostOldRating,
                    opponent_new_rating: game.hostNewRating,
                })
            }
        })

        games_to_insert.forEach(g => redis.rPush('processor:games', JSON.stringify(g)))
        games_v_to_insert.forEach(g => redis.rPush('processor:games_v', JSON.stringify(g)))

        if (games_to_insert.length > 0) {
            logger.info(`player#${playerId}: retrieved games: ${games_to_insert.length}`)

            let opponents = games_v_to_insert.map(g => g.opponent_id)
            let templates = games_to_insert.map(g => g.template_id)

            if (opponents.length > 0) {
                let unknownOpponents = (await (await lobby().query({
                    query: `
                        SELECT arrayJoin({ids:Array(UInt32)}) AS id
                        WHERE NOT dictHas('players_dictionary', id)
                    `,
                    format: 'JSONEachRow',
                    query_params: {
                        ids: opponents,
                    },
                })).json<{ id: number }>()).map(r => r.id)

                if (unknownOpponents.length > 0) {
                    let players_to_insert: PlayerModel[] = []
                    let i = 0

                    while (i < unknownOpponents.length) {
                        if (i > 0) {
                            await sleep(500)
                        }

                        let chunk = unknownOpponents.slice(i, Math.min(i+10, unknownOpponents.length))
                        let players: Players

                        i += 10

                        try {
                            players = await playersAgent.get(chunk)
                        } catch (e: any) {
                            logger.error(`player#${playerId}: opponents: ${e.message}`)
                            continue
                        }

                        players!.items.forEach(i => {
                            players_to_insert.push(i)
                        })
                    }
                    
                    players_to_insert.forEach(p => redis.rPush('processor:players', JSON.stringify(p)))
                }
            }

            if (templates.length > 0) {
                let unknownTemplates = (await (await lobby().query({
                    query: `
                        SELECT arrayJoin({ids:Array(UInt32)}) AS id
                        WHERE NOT dictHas('templates_dictionary', id)
                    `,
                    format: 'JSONEachRow',
                    query_params: {
                        ids: templates,
                    },
                })).json<{ id: number }>()).map(r => r.id)

                if (unknownTemplates.length > 0) {
                    let templates_to_insert: TemplateModel[] = []
                    let i = 0

                    while (i < unknownTemplates.length) {
                        if (i > 0) {
                            await sleep(500)
                        }

                        let chunk = unknownTemplates.slice(i, Math.min(i+10, unknownTemplates.length))
                        let templates: Templates

                        i += 10

                        try {
                            templates = await templatesAgent.get(chunk)
                        } catch (e: any) {
                            logger.error(`player#${playerId}: templates: ${e.message}`)
                            continue
                        }

                        templates!.items.forEach(i => {
                            templates_to_insert.push(i)
                        })
                    }

                    templates_to_insert.forEach(t => redis.rPush('processor:templates', JSON.stringify(t)))
                }
            }
        }
    }
}

main()
