USE lobby;

DROP DICTIONARY IF EXISTS templates_dictionary;

CREATE DICTIONARY templates_dictionary
(
    id UInt32,
    name String
)
PRIMARY KEY id
SOURCE(CLICKHOUSE(
    host 'localhost'
    port 9000
    user 'default'
    password 'xQm8LpsLOolVLryE'
    db 'lobby' table 'templates'
))
LIFETIME(600)
LAYOUT(HASHED());
