use h3players;

DELETE FROM `permissions` WHERE player_id = 1095408;

INSERT INTO `permissions` (player_id, code) VALUES (1095408, 'discussions.add');
INSERT INTO `permissions` (player_id, code) VALUES (1095408, 'discussions.add.unlimit');
INSERT INTO `permissions` (player_id, code) VALUES (1095408, 'posts.add.unlimit');
