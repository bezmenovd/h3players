USE h3players;

DROP TABLE IF EXISTS restrictions;

CREATE TABLE restrictions (
    `player_id` INT UNSIGNED NOT NULL,
    `start_at` INT UNSIGNED NOT NULL,
    `finish_at` INT UNSIGNED NOT NULL,
    `reason` VARCHAR(255) NOT NULL,

    INDEX (`player_id`)
);
