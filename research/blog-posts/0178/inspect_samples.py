"""Verify saved two-INT-column fixtures; not a general binlog parser."""
from pathlib import Path
import struct
import zlib

ROOT = Path(__file__).resolve().parent
lines = []
for name in ('mysql-statement', 'mysql-row-full', 'mysql-row-minimal'):
    raw = (ROOT / 'evidence' / f'{name}.binlog').read_bytes()
    assert raw[:4] == b'\xfebin'
    pos, rows, table_ids, sql_found = 4, [], set(), False
    while pos < len(raw):
        timestamp, kind, server, size, next_pos, flags = struct.unpack_from('<IBIIIH', raw, pos)
        event = raw[pos:pos + size]
        assert size >= 23 and len(event) == size
        assert next_pos == pos + size
        assert zlib.crc32(event[:-4]) == int.from_bytes(event[-4:], 'little')
        body = event[19:-4]
        if kind == 2 and b'UPDATE accounts SET balance=balance-100 WHERE id=7' in body:
            sql_found = True
        if kind == 19:
            table_ids.add(int.from_bytes(body[:6], 'little'))
            p = 8
            n = body[p]
            p += 1
            database = body[p:p+n].decode()
            p += n + 1
            n = body[p]
            p += 1
            table = body[p:p+n].decode()
            p += n + 1
            assert database == 'demo' and table == 'accounts'
            assert body[p:p+3] == bytes([2, 3, 3])
        if kind == 31:
            assert int.from_bytes(body[:6], 'little') in table_ids
            p = 8 + int.from_bytes(body[8:10], 'little')
            assert body[p] == 2
            before_mask, after_mask = body[p+1:p+3]
            p += 3
            images = []
            for mask in (before_mask, after_mask):
                assert body[p] == 0
                p += 1
                values = {}
                for col in range(2):
                    if mask & (1 << col):
                        values[('id', 'balance')[col]] = struct.unpack_from('<i', body, p)[0]
                        p += 4
                images.append(values)
            assert p == len(body)
            rows.append((size, before_mask & 3, after_mask & 3, images))
        pos += size
    assert pos == len(raw)
    if name == 'mysql-statement':
        assert sql_found and not rows
    elif name == 'mysql-row-full':
        assert rows == [(54, 3, 3, [{'id': 7, 'balance': 900}, {'id': 7, 'balance': 800}])]
    else:
        assert rows == [(46, 1, 2, [{'id': 7}, {'balance': 700}])]
    lines.append(f'{name}: CRC32 and event boundaries OK; rows={rows}; SQL update={sql_found}')

messages = [bytes.fromhex(s) for s in (ROOT / 'evidence/postgres-pgoutput.hex').read_text().splitlines()]
assert [m[:1] for m in messages] == [b'B', b'R', b'U', b'C']
u = messages[2]
assert len(u) == 22 and u[5:6] == b'N'
relation = int.from_bytes(u[1:5], 'big')
assert relation == int.from_bytes(messages[1][1:5], 'big') == 16388
assert int.from_bytes(u[6:8], 'big') == 2
p, values = 8, []
for _ in range(2):
    assert u[p:p+1] == b't'
    n = int.from_bytes(u[p+1:p+5], 'big')
    p += 5
    values.append(u[p:p+n].decode())
    p += n
assert p == len(u) and values == ['7', '900']
lines.append(f'PostgreSQL pgoutput: B/R/U/C; U length={len(u)}; relation={relation}; N={values}')
output = '\n'.join(lines) + '\n'
(ROOT / 'evidence/sample-verification.txt').write_text(output)
print(output, end='')
