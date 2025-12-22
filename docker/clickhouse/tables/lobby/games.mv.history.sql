USE lobby;

DROP TABLE IF EXISTS games_mv_history_table;

CREATE TABLE games_mv_history_table
(
    end_timestamp_desc Int32,
    id_desc Int64,
    id UInt32
)
ENGINE = MergeTree
ORDER BY (end_timestamp_desc, id);

DROP VIEW IF EXISTS games_mv_history_view;

CREATE MATERIALIZED VIEW games_mv_history_view 
TO games_mv_history_table 
AS
SELECT
    end_timestamp * -1 as end_timestamp_desc,
    id * -1 as id_desc,
    id
FROM games;

INSERT INTO games_mv_history_table
SELECT
    end_timestamp * -1 as end_timestamp_desc,
    id * -1 as id_desc,
    id
FROM games;
