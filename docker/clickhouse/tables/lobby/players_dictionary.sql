USE lobby;

DROP DICTIONARY IF EXISTS players_dictionary;

CREATE DICTIONARY players_dictionary
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
    db 'lobby' table 'players'
))
LIFETIME(600)
LAYOUT(HASHED());
