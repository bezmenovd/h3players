USE h3players;

DROP TABLE IF EXISTS reports;

CREATE TABLE reports (
    `player_id` INT UNSIGNED NOT NULL,
    `entity_type` TINYINT UNSIGNED NOT NULL,
    `entity_id` INT UNSIGNED NOT NULL,
    `reason` VARCHAR(32) NOT NULL,
    
    `at` INT UNSIGNED NOT NULL,

    PRIMARY KEY (`player_id`, `entity_type`, `entity_id`),
    INDEX (`player_id`),
    INDEX (`entity_type`, `entity_id`)
);
