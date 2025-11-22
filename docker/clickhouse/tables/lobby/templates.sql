USE lobby;

DROP TABLE IF EXISTS templates;

CREATE TABLE templates (
    `id` UInt32,
    `name` String
)
ENGINE = MergeTree()
ORDER BY `id`;
