#!/usr/bin/env python3
"""Exercise the actual Workbench public aggregate SQL on a disposable SQLite DB."""
from pathlib import Path
import re
import sqlite3

source = (Path(__file__).resolve().parent.parent / "functions/api/portfolio-evidence.js").read_text()
match = re.search(r"const QUERY = `(.*?)`;", source, re.S)
assert match, "Query must remain inspectable and source-owned"
query = match.group(1)
db = sqlite3.connect(":memory:")
db.row_factory = sqlite3.Row
db.executescript("""
CREATE TABLE projects (id INTEGER PRIMARY KEY, pages INTEGER, updated_at TEXT);
CREATE TABLE translation_progress_checkpoints (
 id INTEGER PRIMARY KEY, project_id INTEGER, source_pdf_sha256 TEXT, google_doc_revision TEXT);
CREATE TABLE translation_quality_evidence (
 id INTEGER PRIMARY KEY, project_id INTEGER, from_page INTEGER, to_page INTEGER,
 source_pdf_sha256 TEXT, google_doc_revision TEXT);
CREATE TABLE translation_human_review_attestations (
 id INTEGER PRIMARY KEY, project_id INTEGER, source_pdf_sha256 TEXT, google_doc_revision TEXT);
""")
db.executemany("INSERT INTO projects VALUES (?,?,?)", [
    (1, 10, "2026-10-20 08:00:00"),
    (2, 12, "2026-10-20 08:00:00"),
    (3, 15, "2026-10-20 08:00:00"),
    (4, 8, "2026-10-20 08:00:00"),
])
db.executemany("INSERT INTO translation_progress_checkpoints VALUES (?,?,?,?)", [
    (1, 1, "source-a", "old-revision"),
    (2, 1, "source-a", "new-revision"),
    (3, 2, "source-b", "old-revision"),
    (4, 2, "source-b", "new-revision"),
    (5, 3, "source-c", "revision"),
    (6, 4, "source-d", "revision"),
])
db.executemany("INSERT INTO translation_quality_evidence VALUES (?,?,?,?,?,?)", [
    (1, 1, 1, 10, "source-a", "new-revision"),
    (2, 2, 1, 12, "source-b", "old-revision"),
    (3, 3, 1, 15, "source-c", "revision"),
    (4, 4, 2, 8, "source-d", "revision"),
])
db.executemany("INSERT INTO translation_human_review_attestations VALUES (?,?,?,?)", [
    (1, 1, "source-a", "new-revision"),
    (2, 2, "source-b", "old-revision"),
    (3, 4, "source-d", "revision"),
])
data = {r["id"]: (r["whole_qa_receipt"], r["whole_qa_matched_review"]) for r in db.execute(query)}
assert data == {1: (1, 1), 2: (0, 0), 3: (1, 0), 4: (0, 0)}, data
db.execute("INSERT INTO translation_progress_checkpoints VALUES (7, 1, 'source-a', 'unreviewed-change')")
updated = {r["id"]: (r["whole_qa_receipt"], r["whole_qa_matched_review"]) for r in db.execute(query)}
assert updated[1] == (0, 0), "A new manuscript revision must invalidate older receipts and review"
assert sum(pair[0] for pair in updated.values()) == 1
assert sum(pair[1] for pair in updated.values()) == 0
print("Workbench evidence SQLite: latest exact source/revision, whole-page QA and self-declared review counted; stale revisions rejected.")
