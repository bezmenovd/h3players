USE h3players;

DROP TABLE IF EXISTS players_views;

CREATE TABLE players_views (
    `player_id` INT UNSIGNED NOT NULL,
    
    `at` INT UNSIGNED NOT NULL,

    INDEX (`player_id`)
);
