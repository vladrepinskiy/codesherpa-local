import { PGlite } from "@electric-sql/pglite";

let db: PGlite | null = null;

/**
 * Initialize the PGLite database with IndexedDB persistence
 */
export async function initDatabase(): Promise<PGlite> {
  if (db) {
    return db;
  }

  // Initialize PGLite with IndexedDB persistence
  db = new PGlite("idb://codesherpa-db");

  // Wait for the database to be fully initialized
  await db.waitReady;

  // Create tables if they don't exist
  await createSchema(db);

  return db;
}

/**
 * Get the database instance
 */
export function getDatabase(): PGlite {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return db;
}

/**
 * Create database schema
 */
async function createSchema(database: PGlite): Promise<void> {
  await database.exec(`
    -- Repositories table
    CREATE TABLE IF NOT EXISTS repositories (
      id TEXT PRIMARY KEY,
      owner TEXT NOT NULL,
      name TEXT NOT NULL,
      full_name TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT,
      default_branch TEXT,
      imported_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- Files table
    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      repo_id TEXT NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
      path TEXT NOT NULL,
      content TEXT,
      size INTEGER,
      type TEXT,
      sha TEXT,
      last_modified TIMESTAMP,
      UNIQUE(repo_id, path)
    );

    -- Create index on repo_id for faster queries
    CREATE INDEX IF NOT EXISTS idx_files_repo_id ON files(repo_id);
    CREATE INDEX IF NOT EXISTS idx_files_path ON files(path);

    -- Issues table (includes both issues and pull requests)
    CREATE TABLE IF NOT EXISTS issues (
      id TEXT PRIMARY KEY,
      repo_id TEXT NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
      number INTEGER NOT NULL,
      title TEXT NOT NULL,
      body TEXT,
      state TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('issue', 'pull_request')),
      author TEXT,
      labels JSONB,
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP,
      closed_at TIMESTAMP,
      UNIQUE(repo_id, number, type)
    );

    -- Create indexes for issues
    CREATE INDEX IF NOT EXISTS idx_issues_repo_id ON issues(repo_id);
    CREATE INDEX IF NOT EXISTS idx_issues_type ON issues(type);
    CREATE INDEX IF NOT EXISTS idx_issues_state ON issues(state);

    -- Comments table
    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      issue_id TEXT NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
      body TEXT,
      author TEXT,
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP
    );

    -- Create index on issue_id for faster queries
    CREATE INDEX IF NOT EXISTS idx_comments_issue_id ON comments(issue_id);
  `);
}

/**
 * Insert a repository
 */
export async function insertRepository(data: {
  id: string;
  owner: string;
  name: string;
  full_name: string;
  url: string;
  description?: string;
  default_branch?: string;
}): Promise<void> {
  const db = getDatabase();
  await db.query(
    `INSERT INTO repositories (id, owner, name, full_name, url, description, default_branch)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (id) DO UPDATE SET
       owner = EXCLUDED.owner,
       name = EXCLUDED.name,
       full_name = EXCLUDED.full_name,
       url = EXCLUDED.url,
       description = EXCLUDED.description,
       default_branch = EXCLUDED.default_branch,
       imported_at = CURRENT_TIMESTAMP`,
    [
      data.id,
      data.owner,
      data.name,
      data.full_name,
      data.url,
      data.description || null,
      data.default_branch || null,
    ]
  );
}

/**
 * Insert files in batch
 */
export async function insertFiles(
  files: Array<{
    id: string;
    repo_id: string;
    path: string;
    content?: string;
    size?: number;
    type?: string;
    sha?: string;
    last_modified?: Date;
  }>
): Promise<void> {
  const db = getDatabase();

  // Use a transaction for batch insert
  for (const file of files) {
    await db.query(
      `INSERT INTO files (id, repo_id, path, content, size, type, sha, last_modified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (repo_id, path) DO UPDATE SET
         content = EXCLUDED.content,
         size = EXCLUDED.size,
         type = EXCLUDED.type,
         sha = EXCLUDED.sha,
         last_modified = EXCLUDED.last_modified`,
      [
        file.id,
        file.repo_id,
        file.path,
        file.content || null,
        file.size || null,
        file.type || null,
        file.sha || null,
        file.last_modified || null,
      ]
    );
  }
}

/**
 * Insert issues in batch
 */
export async function insertIssues(
  issues: Array<{
    id: string;
    repo_id: string;
    number: number;
    title: string;
    body?: string;
    state: string;
    type: "issue" | "pull_request";
    author?: string;
    labels?: any[];
    created_at: Date;
    updated_at?: Date;
    closed_at?: Date;
  }>
): Promise<void> {
  const db = getDatabase();

  for (const issue of issues) {
    await db.query(
      `INSERT INTO issues (id, repo_id, number, title, body, state, type, author, labels, created_at, updated_at, closed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (repo_id, number, type) DO UPDATE SET
         title = EXCLUDED.title,
         body = EXCLUDED.body,
         state = EXCLUDED.state,
         author = EXCLUDED.author,
         labels = EXCLUDED.labels,
         created_at = EXCLUDED.created_at,
         updated_at = EXCLUDED.updated_at,
         closed_at = EXCLUDED.closed_at`,
      [
        issue.id,
        issue.repo_id,
        issue.number,
        issue.title,
        issue.body || null,
        issue.state,
        issue.type,
        issue.author || null,
        JSON.stringify(issue.labels || []),
        issue.created_at,
        issue.updated_at || null,
        issue.closed_at || null,
      ]
    );
  }
}

/**
 * Insert comments in batch
 */
export async function insertComments(
  comments: Array<{
    id: string;
    issue_id: string;
    body?: string;
    author?: string;
    created_at: Date;
    updated_at?: Date;
  }>
): Promise<void> {
  const db = getDatabase();

  for (const comment of comments) {
    await db.query(
      `INSERT INTO comments (id, issue_id, body, author, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
         body = EXCLUDED.body,
         author = EXCLUDED.author,
         created_at = EXCLUDED.created_at,
         updated_at = EXCLUDED.updated_at`,
      [
        comment.id,
        comment.issue_id,
        comment.body || null,
        comment.author || null,
        comment.created_at,
        comment.updated_at || null,
      ]
    );
  }
}

/**
 * Get statistics about imported data
 */
export async function getImportStats(repoId: string): Promise<{
  filesCount: number;
  issuesCount: number;
  pullRequestsCount: number;
  commentsCount: number;
}> {
  const db = getDatabase();

  const filesResult = await db.query(
    "SELECT COUNT(*) as count FROM files WHERE repo_id = $1",
    [repoId]
  );

  const issuesResult = await db.query(
    "SELECT COUNT(*) as count FROM issues WHERE repo_id = $1 AND type = $2",
    [repoId, "issue"]
  );

  const prsResult = await db.query(
    "SELECT COUNT(*) as count FROM issues WHERE repo_id = $1 AND type = $2",
    [repoId, "pull_request"]
  );

  const commentsResult = await db.query(
    `SELECT COUNT(*) as count FROM comments 
     WHERE issue_id IN (SELECT id FROM issues WHERE repo_id = $1)`,
    [repoId]
  );

  return {
    filesCount: Number(
      (filesResult.rows[0] as { count: string | number }).count
    ),
    issuesCount: Number(
      (issuesResult.rows[0] as { count: string | number }).count
    ),
    pullRequestsCount: Number(
      (prsResult.rows[0] as { count: string | number }).count
    ),
    commentsCount: Number(
      (commentsResult.rows[0] as { count: string | number }).count
    ),
  };
}

/**
 * Clear all data for a repository
 */
export async function clearRepository(repoId: string): Promise<void> {
  const db = getDatabase();
  // Due to CASCADE, deleting the repo will delete all related data
  await db.query("DELETE FROM repositories WHERE id = $1", [repoId]);
}
