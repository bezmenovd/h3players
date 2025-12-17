USE h3players;

DROP TABLE IF EXISTS votes;

CREATE TABLE votes (
    `player_id` INT UNSIGNED NOT NULL,
    `entity_type` TINYINT UNSIGNED NOT NULL,
    `entity_id` INT UNSIGNED NOT NULL,
    `type` TINYINT NOT NULL,
    
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`player_id`, `entity_type`, `entity_id`),
    INDEX (`entity_type`, `entity_id`)
);
