USE lobby;

DROP TABLE IF EXISTS games_mv_daily_table;

CREATE TABLE games_mv_daily_table
(
    end_day Date,
    player_id UInt32,
    template_id UInt32,
    rating_diff_state AggregateFunction(sum, Int64),
    games_count_state AggregateFunction(count, Int64),
    last_game_time_state AggregateFunction(max, UInt32)
)
ENGINE = AggregatingMergeTree()
ORDER BY (end_day, player_id, template_id);

DROP VIEW IF EXISTS games_mv_daily_view;


CREATE MATERIALIZED VIEW games_mv_daily_view TO games_mv_daily_table AS
SELECT
    toDate(end_timestamp) AS end_day,
    player_id,
    template_id,
    sumState(toInt32(player_new_rating) - toInt32(player_old_rating)) AS rating_diff_state,
    countState() AS games_count_state,
    maxState(end_timestamp) AS last_game_time_state
FROM games_v
GROUP BY end_day, player_id, template_id;

INSERT INTO games_mv_daily_table
SELECT
    toDate(end_timestamp) AS end_day,
    player_id,
    template_id,
    sumState(toInt32(player_new_rating) - toInt32(player_old_rating)) ,
    countState(),
    maxState(end_timestamp)
FROM games_v
WHERE end_timestamp >= toUInt32(toStartOfDay(now()))
GROUP BY end_day, player_id, template_id;
