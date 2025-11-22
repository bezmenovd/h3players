import { Game } from "./msgin"

export const gameIsValid = (game: Game): boolean => {
    if (game.endDay > 4096) {
        return false
    }
    if (game.endTimestamp < game.startTimestamp) {
        return false
    }
    if (game.hostColor > 7) {
        return false
    }
    if (game.opponentColor > 7) {
        return false
    }
    if (Math.abs(game.hostOldRating - game.hostNewRating) > 128) {
        return false
    }
    if (Math.abs(game.opponentOldRating - game.opponentNewRating) > 128) {
        return false
    }
    if (game.hostTown > 11) {
        return false
    }
    if (game.opponentTown > 11) {
        return false
    }
    if (! [0,1,2,4,8].includes(game.status)) {
        return false
    }
    if (! [0,1,2].includes(game.levels)) {
        return false
    }
    if (![0,36,72,108,144,180,216,252].includes(game.size)) {
        return false
    }
    return true
}
