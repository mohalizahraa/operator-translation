#!/usr/bin/env python3
"""Synthetic D1/SQLite comment-link compatibility and no-loss tests.

No real manuscript, production D1, OAuth token, or Google Docs comment is touched.
"""
import sqlite3
from pathlib import Path

schema=(Path(__file__).resolve().parents[1]/"schema.sql").read_text()
db=sqlite3.connect(":memory:", isolation_level=None)
db.execute("PRAGMA foreign_keys=ON")
db.executescript(schema)
db.execute("INSERT INTO projects(id,title_ar,assignee,google_doc_url) VALUES (1,'كتاب ١','Zahraa','https://docs.google.com/document/d/knownEnglishBookId123456789/edit')")
db.execute("INSERT INTO projects(id,title_ar,assignee,google_doc_url) VALUES (2,'كتاب ٢','Mohammed','https://docs.google.com/document/d/otherEnglishBookId123456789/edit')")
db.execute("""INSERT INTO translation_questions(project_id,question_key,source_page,arabic_text,rationale)
VALUES (1,'book1.page8.q1',8,'النص الأصلي','Disputed rendering')""")
db.execute("""INSERT INTO translation_questions(project_id,question_key,source_page,arabic_text,rationale)
VALUES (2,'book2.page5.q1',5,'النص الآخر','Disputed rendering')""")
question_id=db.execute("SELECT id FROM translation_questions WHERE project_id=1").fetchone()[0]
other_id=db.execute("SELECT id FROM translation_questions WHERE project_id=2").fetchone()[0]

def commit_link(question,doc="knownEnglishBookId123456789",comment="doco.nativeOne123456",actor="Zahraa"):
    db.execute("BEGIN")
    try:
        db.execute("""INSERT OR IGNORE INTO translation_question_comments
          (question_id,google_doc_id,comment_id,anchor_id,tab_id,quoted_text,document_revision,recorded_by)
          VALUES (?,?,?,'kix.anchorOne123','t.0','Disputed text','docRevisionA1',?)""",
          (question,doc,comment,actor))
        db.execute("""INSERT INTO translation_question_events(question_id,actor,action,payload_json)
          SELECT ?,?,'native comment association recorded','{}' WHERE changes()>0""",(question,actor))
        db.execute("""INSERT INTO activity(project_id,actor,action,after_json)
          SELECT 1,?,'translation comment association recorded','{}' WHERE changes()>0""",(actor,))
        db.execute("COMMIT")
    except:
        db.execute("ROLLBACK")
        raise

commit_link(question_id)
commit_link(question_id)
assert db.execute("SELECT COUNT(*) FROM translation_question_comments").fetchone()[0]==1
assert db.execute("SELECT COUNT(*) FROM translation_question_events").fetchone()[0]==1
assert db.execute("SELECT COUNT(*) FROM activity").fetchone()[0]==1
assert db.execute("SELECT status FROM translation_questions WHERE id=?",(question_id,)).fetchone()[0]=="unresolved"

# Unique native comment cannot be silently attached to another question/book.
commit_link(other_id,doc="knownEnglishBookId123456789")
assert db.execute("SELECT COUNT(*) FROM translation_question_comments").fetchone()[0]==1
assert db.execute("SELECT COUNT(*) FROM translation_question_events").fetchone()[0]==1

# Atomicity: if event history fails, the association must be rolled back.
db.execute("""CREATE TRIGGER reject_comment_activity BEFORE INSERT ON activity
WHEN NEW.action='translation comment association recorded'
BEGIN SELECT RAISE(ABORT,'reject synthetic activity'); END""")
try:
    commit_link(other_id,doc="otherEnglishBookId123456789",comment="doco.nativeTwo123456")
    raise AssertionError("Synthetic activity rejection failed")
except sqlite3.IntegrityError:
    pass
assert db.execute("SELECT COUNT(*) FROM translation_question_comments").fetchone()[0]==1
assert db.execute("SELECT COUNT(*) FROM translation_question_events").fetchone()[0]==1

# Observed native comment resolution is a separate record from reviewer judgment.
db.execute("""UPDATE translation_question_comments
  SET observed_state='resolved',last_observed_revision='docRevisionA2',
      last_observed_at=CURRENT_TIMESTAMP
  WHERE question_id=? AND observed_state='unknown' AND last_observed_revision IS NULL""",
  (question_id,))
assert db.execute("SELECT observed_state,last_observed_revision FROM translation_question_comments WHERE question_id=?",
                  (question_id,)).fetchone()==("resolved","docRevisionA2")
assert db.execute("SELECT status FROM translation_questions WHERE id=?",(question_id,)).fetchone()[0]=="unresolved"

# A competing old-state event cannot overwrite a newer observation.
result=db.execute("""UPDATE translation_question_comments SET observed_state='open'
  WHERE question_id=? AND observed_state='unknown'""",(question_id,))
assert result.rowcount==0
assert db.execute("SELECT observed_state FROM translation_question_comments WHERE question_id=?",
                  (question_id,)).fetchone()[0]=="resolved"

# No migration may rewrite the original Arabic or reviewer decisions.
assert db.execute("SELECT arabic_text,status FROM translation_questions WHERE id=?",(question_id,)).fetchone()==("النص الأصلي","unresolved")
print("Native comment-link D1 schema/transaction simulation: PASS")
