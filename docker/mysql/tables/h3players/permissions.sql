USE h3players;

DROP TABLE IF EXISTS permissions;

CREATE TABLE permissions (
    `player_id` INT UNSIGNED NOT NULL,
    `code` VARCHAR(32) NOT NULL,

    INDEX (`player_id`, `code`)
);
