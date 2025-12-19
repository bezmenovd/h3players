USE h3players;

DROP TABLE IF EXISTS posts;

CREATE TABLE posts (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `player_id` INT UNSIGNED NOT NULL,
    `discussion_id` INT UNSIGNED NOT NULL,
    `slug` VARCHAR(64) NOT NULL,

    `created_at` INT UNSIGNED NOT NULL,
    `updated_at` INT UNSIGNED NOT NULL,
    `deleted_at` INT UNSIGNED DEFAULT NULL,

    PRIMARY KEY (`id`),
    INDEX (`player_id`),
    INDEX (`discussion_id`)
);
