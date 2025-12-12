USE internal;

ALTER TABLE requests ADD INDEX idx_ip_hash_ngram (ip_hash) TYPE ngrambf_v1(3, 3, 4, 0) GRANULARITY 4;
ALTER TABLE requests ADD INDEX idx_token_ngram (token) TYPE ngrambf_v1(3, 3, 4, 0) GRANULARITY 4;
