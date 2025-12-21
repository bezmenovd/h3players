USE h3players;

DROP TABLE IF EXISTS post_views;

CREATE TABLE post_views (
    `post_id` INT UNSIGNED NOT NULL,
    `player_id` INT UNSIGNED NOT NULL,
    
    `at` INT UNSIGNED NOT NULL,

    PRIMARY KEY (`post_id`, `player_id`)
);
