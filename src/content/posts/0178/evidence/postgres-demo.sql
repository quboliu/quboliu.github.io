-- 在新的实验数据库中执行；wal_level=logical，需有创建复制槽权限。
CREATE TABLE accounts(id integer PRIMARY KEY, balance integer NOT NULL);
INSERT INTO accounts VALUES (7,1000);
CREATE PUBLICATION demo_pub FOR TABLE accounts;
SELECT * FROM pg_create_logical_replication_slot('demo_text','test_decoding');
SELECT * FROM pg_create_logical_replication_slot('demo_binary','pgoutput');
CHECKPOINT;
SELECT pg_current_wal_insert_lsn() AS begin_lsn;
BEGIN;
UPDATE accounts SET balance=balance-100 WHERE id=7;
COMMIT;
SELECT pg_current_wal_insert_lsn() AS end_lsn;
SELECT lsn,xid,data FROM pg_logical_slot_peek_changes('demo_text',NULL,NULL);
SELECT lsn,xid,encode(data,'hex') AS payload_hex
FROM pg_logical_slot_peek_binary_changes('demo_binary',NULL,NULL,
    'proto_version','1','publication_names','demo_pub');
SELECT pg_walfile_name(pg_current_wal_lsn());
SHOW data_directory;
