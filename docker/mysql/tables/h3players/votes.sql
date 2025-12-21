USE h3players;

DROP TABLE IF EXISTS votes;

CREATE TABLE votes (
    `player_id` INT UNSIGNED NOT NULL,
    `entity_type` TINYINT UNSIGNED NOT NULL,
    `entity_id` INT UNSIGNED NOT NULL,
    `type` TINYINT NOT NULL,
    
    `at` INT UNSIGNED NOT NULL,

    PRIMARY KEY (`player_id`, `entity_type`, `entity_id`)
);
