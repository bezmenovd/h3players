USE h3players;

DROP TABLE IF EXISTS tokens;

CREATE TABLE tokens (
    player_id INT UNSIGNED,
    token VARCHAR(32) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX (player_id)
);
