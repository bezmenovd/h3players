USE internal;

DROP TABLE IF EXISTS requests;

CREATE TABLE requests (
    `datetime` DateTime,
    `duration` UInt32,
    `ip_hash` String,
    `token` String,
    `method` String,
    `url` String,
    `body` String,
    `status` UInt16
)
ENGINE = MergeTree()
PARTITION BY toYYYYMMDD(`datetime`)
ORDER BY (`datetime`)
PRIMARY KEY (`datetime`);
