USE lobby;

DROP TABLE IF EXISTS games_v;

CREATE TABLE games_v 
(
    `player_id` UInt32,
    `opponent_id` UInt32,
    `game_id` UInt32,
    `template_id` UInt32,
    `is_random` Bool,
    `size` UInt8,
    `levels` UInt8,
    `is_win` Bool,
    `is_draw` Bool,
    `is_loss` Bool,
    `restarts` UInt8,
    `end_day` UInt16,
    `start_timestamp` UInt32,
    `end_timestamp` UInt32,
    `player_color` UInt8,
    `player_town` UInt8,
    `player_hero` UInt8,
    `player_old_rating` UInt16,
    `player_new_rating` UInt16,
    `opponent_color` UInt8,
    `opponent_town` UInt8,
    `opponent_hero` UInt8,
    `opponent_old_rating` UInt16,
    `opponent_new_rating` UInt16,
)
ENGINE = MergeTree
ORDER BY (player_id, game_id);
