USE lobby;

DROP TABLE IF EXISTS online;

CREATE TABLE online (
    `datetime` Datetime DEFAULT now(),
    `online` UInt16
)
ENGINE = MergeTree()
PARTITION BY toYYYYMMDD(`datetime`)
PRIMARY KEY (`datetime`);
