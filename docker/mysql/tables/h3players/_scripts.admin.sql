use h3players;

DELETE FROM `permissions` WHERE player_id = 1233411;

INSERT INTO `permissions` (player_id, code) VALUES (1233411, 'discussions.add');
INSERT INTO `permissions` (player_id, code) VALUES (1233411, 'discussions.add.unlimit');
INSERT INTO `permissions` (player_id, code) VALUES (1233411, 'posts.add.unlimit');
INSERT INTO `permissions` (player_id, code) VALUES (1233411, 'posts.moderate');

INSERT INTO `tokens` (player_id, token) VALUES (1233411, '48cfb118e0ba40dd07b892e87cb7c54f');
