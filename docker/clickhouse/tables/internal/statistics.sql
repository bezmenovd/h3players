USE internal;

DROP TABLE IF EXISTS statistics;

CREATE TABLE statistics (
    `name` String,
    `datetime` DateTime DEFAULT now(),
    `sent_bytes` UInt32 DEFAULT 0,
    `sent_messages` UInt16 DEFAULT 0,
    `received_bytes` UInt32 DEFAULT 0,
    `received_messages` UInt16 DEFAULT 0
)
ENGINE = MergeTree()
PARTITION BY toYYYYMMDD(`datetime`)
PRIMARY KEY (`name`, `datetime`);
