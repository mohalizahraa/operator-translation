#!/usr/bin/env python3
"""Offline synthetic D1-schema export/restore rehearsal. Never touches live DB or books."""
from pathlib import Path
import hashlib, sqlite3
from tempfile import TemporaryDirectory

schema = (Path(__file__).resolve().parents[1] / "schema.sql").read_text()
with TemporaryDirectory(prefix="wb-restore-rehearsal-") as scratch:
    source = sqlite3.connect(":memory:")
    source.executescript(schema)
    source.execute("INSERT INTO projects(id,title_ar,title_en,assignee,status,pages,translated_pages) VALUES (9,'اختبار','Synthetic test','Zahraa','completed',2,2)")
    source.execute("INSERT INTO translation_questions(project_id,question_key,source_page,arabic_text,rationale,status,severity,reviewer_answer) VALUES (9,'test-question',1,'نص تجريبي','Synthetic question','answered','blocking','Test answer')")
    qid = source.execute("SELECT id FROM translation_questions WHERE question_key='test-question'").fetchone()[0]
    source.execute("INSERT INTO translation_question_events(question_id,actor,action,payload_json) VALUES (?,'Zahraa','question answered','{}')",(qid,))
    source.execute("INSERT INTO translation_quality_evidence(project_id,from_page,to_page,source_pdf_sha256,google_doc_revision,report_json,recorded_by) VALUES (9,1,2,?,?,'{}','Zahraa')",('a'*64,'public-export-sha256:'+'b'*64))
    source.execute("INSERT INTO translation_human_review_attestations(project_id,source_pdf_sha256,google_doc_revision,reviewer_name,declared_scope) VALUES (9,?,?,'Zahraa','entire final manuscript')",('a'*64,'public-export-sha256:'+'b'*64))
    source.commit()
    exported = "\n".join(source.iterdump()) + "\n"
    backup = Path(scratch) / "synthetic-restore.sql"
    backup.write_text(exported)
    checksum=hashlib.sha256(backup.read_bytes()).hexdigest()
    assert checksum==hashlib.sha256(exported.encode()).hexdigest()
    restored=sqlite3.connect(":memory:")
    restored.executescript(backup.read_text())
    for table in ("projects","translation_questions","translation_question_events","translation_quality_evidence","translation_human_review_attestations"):
        before=source.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
        after=restored.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
        assert before==after, f"{table}: mismatched row count"
    assert restored.execute("PRAGMA integrity_check").fetchone()[0]=="ok"
    assert restored.execute("PRAGMA foreign_key_check").fetchall()==[]
    assert restored.execute("SELECT reviewer_answer FROM translation_questions WHERE question_key='test-question'").fetchone()[0]=="Test answer"
    assert restored.execute("SELECT COUNT(*) FROM translation_human_review_attestations WHERE reviewer_name='Zahraa'").fetchone()[0]==1
    restored.close()
    source.close()
print("Synthetic D1 schema export/restore rehearsal: PASS (not a live backup; no private data retained).")
