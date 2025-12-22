USE lobby;

DROP TABLE IF EXISTS templates_mv_gc_table;

CREATE TABLE templates_mv_gc_table
(
    id UInt32,
    games_count UInt32
)
ENGINE = SummingMergeTree
ORDER BY id;

DROP VIEW IF EXISTS templates_mv_gc_view;

CREATE MATERIALIZED VIEW templates_mv_gc_view 
TO templates_mv_gc_table 
AS
SELECT template_id, count()
FROM games
GROUP BY template_id;

INSERT INTO templates_mv_gc_table
SELECT template_id, count()
FROM games
GROUP BY template_id;
