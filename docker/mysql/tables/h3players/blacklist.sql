USE h3players;

DROP TABLE IF EXISTS blacklist;

CREATE TABLE blacklist (
    `player_id` INT UNSIGNED NOT NULL,
    `target_player_id` INT UNSIGNED NOT NULL,

    PRIMARY KEY (`player_id`, `target_player_id`)
);
