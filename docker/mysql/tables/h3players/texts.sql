USE h3players;

DROP TABLE IF EXISTS texts;

CREATE TABLE texts (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `player_id` INT UNSIGNED NOT NULL,
    `entity_type` TINYINT UNSIGNED NOT NULL,
    `entity_id` INT UNSIGNED NOT NULL,
    `language` TINYINT UNSIGNED NOT NULL,
    `tag` VARCHAR(16) DEFAULT NULL,
    `value` TEXT,

    `at` INT UNSIGNED NOT NULL,

    PRIMARY KEY (`id`),
    INDEX (`player_id`),
    INDEX (`entity_type`),
    INDEX (`entity_id`),
    INDEX (`language`)
);
