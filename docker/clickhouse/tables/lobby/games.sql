USE lobby;

DROP TABLE IF EXISTS games;

CREATE TABLE games
(
    id UInt32,
    template_id UInt32,
    game_type UInt8,

    `size` UInt8,
    levels UInt8,
    `status` UInt8,

    restarts UInt8,
    end_day UInt16,

    start_timestamp UInt32,
    end_timestamp UInt32,

    host_id UInt32,
    host_color UInt8,
    host_town UInt8,
    host_hero UInt8,
    host_old_rating UInt16,
    host_new_rating UInt16,

    opponent_id UInt32,
    opponent_color UInt8,
    opponent_town UInt8,
    opponent_hero UInt8,
    opponent_old_rating UInt16,
    opponent_new_rating UInt16
)
ENGINE = MergeTree()
ORDER BY (id);
