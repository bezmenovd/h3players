import { Client } from './src/client'
import { logger } from './src/services/logger'
import { Supervisor } from './src/supervisor'
import { sendMessage } from './src/services/telegram'
import { Postman } from './src/postman'
import { createClient } from 'redis'
import { sleep } from './src/helpers/sleep'
import { lobby } from './src/services/clickhouse'
import { Game, GameType, GameStatus } from './src/types/msgin'
import { HistoryAgent } from './src/agents/history'
import { GameModel, GameVModel } from './src/models/lobby'
import config from './config'


process.env.TZ = 'Europe/Moscow'


async function main() {
    logger.info('starting..')

    const redis = createClient({
        socket: {
            host: 'redis',
        }
    })

    redis.connect()

    const client = new Client('journalist', 'h3players_bot3')
    const postman = new Postman(client)
    
    const supervisor = new Supervisor()
    supervisor.addClient(client)
    
    await client.connect()

    process.on('uncaughtException', async (err: Error) => {
        sendMessage(`${err.message}\n${err.stack}`)
        await client.disconnect()
        await client.connect()
    })
    let historyAgent = new HistoryAgent(postman)

    while (true) {
        if (! client.isConnected()) {
            logger.info('is not connected, sleeping')
            await sleep(10_000)
            continue
        }

        let event = await redis.lPop('events:spectator:player-rating-changed')
        if (! event) {
            continue
        }

        let { playerId } = JSON.parse(event)

        try {
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
            })).json<GameVModel>()

            let beforeTimestamp: number|undefined = undefined

            while (true) {
                let history = await historyAgent.get(448, beforeTimestamp)

                newGames = newGames.concat(history.games)

                if (history.games.length !== 20) break
                if (game_v_last_row.length === 1 && game_v_last_row[0].end_timestamp >= history.games[19].endTimestamp) break

                beforeTimestamp = history.games[19].endTimestamp - 1

                await sleep(600)
            }

            let games_to_insert: GameModel[] = []
            let games_v_to_insert: GameVModel[] = []

            newGames.filter(g => g.status !== GameStatus.NotFinished).forEach(game => {
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

                games_v_to_insert.push({
                    player_id: game.hostId,
                    opponent_id: game.opponentId,
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
                    opponent_color: game.opponentColor,
                    opponent_town: game.opponentTown,
                    opponent_hero: game.opponentHero,
                    opponent_old_rating: game.opponentOldRating,
                    opponent_new_rating: game.opponentNewRating,
                })
                
                games_v_to_insert.push({
                    player_id: game.opponentId,
                    opponent_id: game.hostId,
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
                    opponent_color: game.hostColor,
                    opponent_town: game.hostTown,
                    opponent_hero: game.hostHero,
                    opponent_old_rating: game.hostOldRating,
                    opponent_new_rating: game.hostNewRating,
                })
            })

            lobby().insert({
                table: `games`,
                values: games_to_insert,
                format: 'JSONEachRow',
            })

            lobby().insert({
                table: `games_v`,
                values: games_v_to_insert,
                format: 'JSONEachRow',
            })

            logger.info(`loaded ${newGames.length} games of player ${playerId}`)

            await sleep(500)
        } catch (e: any) {
            if (! client.isConnected()) {
                logger.info('error caused by disconnect')
                return
            }

            await sleep(5000)

            await redis.rPush('events:spectator:player-rating-changed', JSON.stringify({ playerId }))

            throw e;
        }
    }
}

main()
