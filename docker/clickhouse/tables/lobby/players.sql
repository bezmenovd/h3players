USE lobby;

DROP TABLE IF EXISTS players;

CREATE TABLE players (
    id UInt32,
    name String
)
ENGINE = MergeTree()
ORDER BY id;
