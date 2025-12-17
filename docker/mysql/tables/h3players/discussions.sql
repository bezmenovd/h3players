USE h3players;

DROP TABLE IF EXISTS discussions;

CREATE TABLE discussions (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `player_id` INT UNSIGNED NOT NULL,
    `created_at` INT UNSIGNED NOT NULL,
    `is_public` BOOLEAN DEFAULT TRUE,
    `is_closed` BOOLEAN DEFAULT FALSE,
    `slug` VARCHAR(32) NOT NULL UNIQUE,

    PRIMARY KEY (`id`),
    INDEX (`player_id`)
);
