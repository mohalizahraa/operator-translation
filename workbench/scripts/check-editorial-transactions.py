#!/usr/bin/env python3
"""Exercise SQLite/D1 question transaction semantics on entirely synthetic data."""
import sqlite3
from pathlib import Path
s=(Path(__file__).resolve().parents[1]/'schema.sql').read_text()

def conn():
 d=sqlite3.connect(':memory:',isolation_level=None)
 d.executescript(s)
 d.execute("INSERT INTO projects(id,title_ar,assignee) VALUES (1,'اختبار','Zahraa')")
 return d

d=conn()
def capture():
 d.execute("BEGIN")
 try:
  d.execute("INSERT OR IGNORE INTO translation_questions(project_id,question_key,source_page,arabic_text,rationale) VALUES (1,'test-key',1,'نص','Test')")
  d.execute("""INSERT INTO translation_question_events(question_id,actor,action,payload_json)
       SELECT id,'Zahraa','question captured','{}' FROM translation_questions
       WHERE project_id=1 AND question_key='test-key' AND changes()>0""")
  d.execute("""INSERT INTO activity(project_id,actor,action,after_json)
       SELECT 1,'Zahraa','translation question captured','{}' WHERE changes()>0""")
  d.execute("COMMIT")
 except:
  d.execute("ROLLBACK")
  raise
capture();capture()
for table in ('translation_questions','translation_question_events','activity'):
 assert d.execute(f'SELECT COUNT(*) FROM {table}').fetchone()[0]==1,f'duplicate {table}'
qid=d.execute("SELECT id FROM translation_questions").fetchone()[0]

def decide(expected,new):
 d.execute("BEGIN")
 try:
  d.execute("UPDATE translation_questions SET status=? WHERE id=? AND status=?",(new,qid,expected))
  n=d.execute("SELECT changes()").fetchone()[0]
  # Mimic the production batch's immediately following conditional audit statements.
  d.execute("""INSERT INTO translation_question_events(question_id,actor,action,payload_json)
       SELECT ?,'Zahraa',?,'{}' WHERE changes()>0""",(qid,'question '+new)) if False else None
  # SELECT changes() above resets the last-statement changes counter; run actual
  # production statement sequence without querying in between instead.
  d.execute("ROLLBACK")
 except:
  d.execute("ROLLBACK")
  raise
def atomic_decision(expected,new):
 d.execute("BEGIN")
 d.execute("UPDATE translation_questions SET status=? WHERE id=? AND status=?",(new,qid,expected))
 d.execute("INSERT INTO translation_question_events(question_id,actor,action,payload_json) SELECT ?,'Zahraa',?,'{}' WHERE changes()>0",(qid,'question '+new))
 d.execute("INSERT INTO activity(project_id,actor,action,after_json) SELECT 1,'Zahraa',?,'{}' WHERE changes()>0",('question '+new,))
 d.execute("COMMIT")
atomic_decision('unresolved','answered')
atomic_decision('unresolved','answered')
assert d.execute("SELECT status FROM translation_questions WHERE id=?",(qid,)).fetchone()[0]=='answered'
assert d.execute("SELECT COUNT(*) FROM translation_question_events").fetchone()[0]==2
assert d.execute("SELECT COUNT(*) FROM activity").fetchone()[0]==2
d.close()

broken=conn()
broken.execute("""CREATE TRIGGER audit_fail BEFORE INSERT ON activity BEGIN SELECT RAISE(ABORT,'audit failure'); END""")
try:
 broken.execute("BEGIN")
 broken.execute("INSERT INTO translation_questions(project_id,question_key,source_page,arabic_text,rationale) VALUES (1,'broken',1,'نص','Test')")
 broken.execute("""INSERT INTO translation_question_events(question_id,actor,action,payload_json)
   SELECT id,'Zahraa','question captured','{}' FROM translation_questions WHERE question_key='broken' AND changes()>0""")
 broken.execute("INSERT INTO activity(project_id,actor,action,after_json) SELECT 1,'Zahraa','question captured','{}' WHERE changes()>0")
 broken.execute("COMMIT")
 raise AssertionError('Artificial failed audit unexpectedly committed')
except sqlite3.IntegrityError:
 broken.execute("ROLLBACK")
assert broken.execute("SELECT COUNT(*) FROM translation_questions").fetchone()[0]==0
assert broken.execute("SELECT COUNT(*) FROM translation_question_events").fetchone()[0]==0
print("Editorial D1-style transaction simulation: PASS (idempotent, CAS, rollback).")
