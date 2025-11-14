USE lobby;

ALTER TABLE players ADD INDEX idx_name_ngram (name) TYPE ngrambf_v1(3, 3, 4, 0) GRANULARITY 4;
