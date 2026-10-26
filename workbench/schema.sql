PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title_ar TEXT NOT NULL,
  title_en TEXT,
  catalog_id TEXT,
  translit TEXT,
  author TEXT,
  author_ar TEXT,
  category TEXT,
  topic_en TEXT,
  topic_ar TEXT,
  package_url TEXT,
  pages INTEGER,
  volumes INTEGER,
  catalog_date TEXT,
  assignee TEXT NOT NULL DEFAULT 'Unassigned' CHECK (assignee IN ('Zahraa','Mohammed','Brother','Both','Unassigned')),
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','review','completed','published')),
  source_url TEXT,
  source_pdf_url TEXT,
  pdf_status TEXT NOT NULL DEFAULT 'unchecked' CHECK (pdf_status IN ('unchecked','available','missing')),
  pdf_checked_at TEXT,
  pdf_check_note TEXT,
  google_doc_url TEXT,
  english_pdf_url TEXT,
  questions_doc_url TEXT,
  translated_pages INTEGER NOT NULL DEFAULT 0 CHECK (translated_pages >= 0),
  translation_progress_at TEXT,
  cover_url TEXT,
  start_date TEXT,
  due_date TEXT,
  notes TEXT,
  completed_at TEXT,
  completed_by TEXT,
  published_at TEXT,
  published_by TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  before_json TEXT,
  after_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_catalog_id ON projects(catalog_id) WHERE catalog_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_assignee ON projects(assignee);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON activity(created_at DESC);

CREATE TABLE IF NOT EXISTS translation_progress_checkpoints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  from_pages INTEGER NOT NULL,
  to_pages INTEGER NOT NULL,
  source_total_pages INTEGER NOT NULL,
  source_page_basis TEXT NOT NULL DEFAULT 'physical_pdf',
  source_pdf_sha256 TEXT NOT NULL,
  google_doc_revision TEXT NOT NULL,
  verification_note TEXT,
  actor TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_translation_progress_project_created ON translation_progress_checkpoints(project_id, created_at DESC);

CREATE TABLE IF NOT EXISTS translation_focus (
  assignee TEXT PRIMARY KEY CHECK (assignee IN ('Zahraa','Mohammed','Brother')),
  project_id INTEGER NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_translation_focus_project ON translation_focus(project_id);

CREATE TABLE IF NOT EXISTS translation_source_packs (
  project_id INTEGER PRIMARY KEY,
  source_text_kind TEXT,
  source_text_url TEXT,
  recovery_routes_json TEXT NOT NULL DEFAULT '[]',
  page_alignment_note TEXT,
  known_issues TEXT,
  resume_note TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS project_covers (
  project_id INTEGER PRIMARY KEY,
  mime_type TEXT NOT NULL,
  image_bytes BLOB NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS translation_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  question_key TEXT NOT NULL,
  source_page INTEGER NOT NULL CHECK (source_page > 0),
  source_location TEXT,
  arabic_text TEXT NOT NULL,
  context_text TEXT,
  alternatives_json TEXT NOT NULL DEFAULT '[]',
  proposed_english TEXT,
  rationale TEXT NOT NULL,
  confidence TEXT NOT NULL DEFAULT 'uncertain',
  severity TEXT NOT NULL DEFAULT 'review' CHECK (severity IN ('review','blocking')),
  status TEXT NOT NULL DEFAULT 'unresolved' CHECK (status IN ('unresolved','answered','applied')),
  reviewer_answer TEXT,
  applied_reference TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (project_id, question_key),
  FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_translation_questions_project_status ON translation_questions(project_id,status,source_page);

CREATE TABLE IF NOT EXISTS translation_question_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER NOT NULL,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(question_id) REFERENCES translation_questions(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_question_events_question ON translation_question_events(question_id,id);

-- Native Docs comment associations are a revisable UI projection over immutable
-- D1 translation_questions decisions. No Google OAuth tokens are stored here.
CREATE TABLE IF NOT EXISTS translation_question_comments (
  question_id INTEGER PRIMARY KEY,
  google_doc_id TEXT NOT NULL,
  comment_id TEXT NOT NULL,
  anchor_id TEXT NOT NULL,
  tab_id TEXT NOT NULL,
  quoted_text TEXT NOT NULL,
  document_revision TEXT NOT NULL,
  observed_state TEXT NOT NULL DEFAULT 'unknown',
  last_observed_revision TEXT,
  last_observed_at TEXT CHECK (observed_state IN ('open','resolved','unknown')),
  verification_status TEXT NOT NULL DEFAULT 'connector_reported',
  recorded_by TEXT NOT NULL,
  recorded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (google_doc_id, comment_id),
  FOREIGN KEY (question_id) REFERENCES translation_questions(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_translation_comment_document
  ON translation_question_comments(google_doc_id, comment_id);

CREATE TABLE IF NOT EXISTS translation_quality_evidence (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  from_page INTEGER NOT NULL,
  to_page INTEGER NOT NULL,
  source_pdf_sha256 TEXT NOT NULL,
  google_doc_revision TEXT NOT NULL,
  report_json TEXT NOT NULL,
  recorded_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id,from_page,to_page,source_pdf_sha256,google_doc_revision),
  FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_quality_evidence_project ON translation_quality_evidence(project_id,to_page);

CREATE TABLE IF NOT EXISTS translation_human_review_attestations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  source_pdf_sha256 TEXT NOT NULL,
  google_doc_revision TEXT NOT NULL,
  reviewer_name TEXT NOT NULL,
  declared_scope TEXT NOT NULL,
  approved_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id,source_pdf_sha256,google_doc_revision,reviewer_name),
  FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_human_review_project ON translation_human_review_attestations(project_id,approved_at);
