USE h3players;

DROP TABLE IF EXISTS messages;

CREATE TABLE messages (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `player_id` INT UNSIGNED NOT NULL,
    `post_id` INT UNSIGNED NOT NULL,
    `parent_id` INT UNSIGNED,
    `text` TEXT,

    `created_at` INT UNSIGNED NOT NULL,
    `updated_at` INT UNSIGNED NOT NULL,
    `deleted_at` INT UNSIGNED DEFAULT NULL,

    PRIMARY KEY (`id`),
    INDEX (`player_id`),
    INDEX (`post_id`),
    INDEX (`parent_id`)
);
