USE lobby;

DROP TABLE IF EXISTS templates_mv_stats_table;

CREATE TABLE templates_mv_stats_table
(
    id UInt32,
    games_count UInt64,
    games_duration UInt64,
    players_uniq AggregateFunction(uniq, UInt32)
)
ENGINE = SummingMergeTree
ORDER BY id;

DROP VIEW IF EXISTS templates_mv_stats_view;

CREATE MATERIALIZED VIEW templates_mv_stats_view 
TO templates_mv_stats_table 
AS
SELECT 
    template_id AS id, 
    count() AS games_count, 
    sum(end_timestamp - start_timestamp) AS games_duration,
    uniqState(arrayJoin([host_id, opponent_id])) AS players_uniq
FROM games
WHERE end_timestamp > start_timestamp 
  AND (end_timestamp - start_timestamp) < 57600
GROUP BY id;

INSERT INTO templates_mv_stats_table
SELECT 
    template_id AS id, 
    count() AS games_count, 
    sum(end_timestamp - start_timestamp) AS games_duration,
    uniqState(arrayJoin([host_id, opponent_id])) AS players_uniq
FROM games
WHERE end_timestamp > start_timestamp 
  AND (end_timestamp - start_timestamp) < 57600
GROUP BY id;
