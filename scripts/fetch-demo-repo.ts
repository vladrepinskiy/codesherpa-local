import { writeFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DEMO_REPO_OWNER = "emilkowalski";
const DEMO_REPO_NAME = "sonner";
const DEMO_REPO_ID_PREFIX = "demo-";
const FILE_ID_PREFIX = "file-";
const ISSUE_ID_PREFIX = "issue-";
const COMMENT_ID_PREFIX = "comment-";

const CODE_FILE_EXTENSIONS = [
  "ts",
  "tsx",
  "js",
  "jsx",
  "py",
  "java",
  "cpp",
  "c",
  "h",
  "go",
  "rs",
  "rb",
  "php",
  "cs",
] as const;

const TEXT_FILE_EXTENSIONS = [
  "md",
  "txt",
  "json",
  "yaml",
  "yml",
  "xml",
  "html",
  "css",
  "log",
] as const;

const IMAGE_FILE_EXTENSIONS = [
  "png",
  "jpg",
  "jpeg",
  "gif",
  "svg",
  "ico",
] as const;

const FILE_TYPE_CODE = "code";
const FILE_TYPE_TEXT = "text";
const FILE_TYPE_IMAGE = "image";
const FILE_TYPE_FILE = "file";

type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
  };
  description: string | null;
  html_url: string;
  default_branch: string;
};

type GitHubTreeItem = {
  path: string;
  mode: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
  url: string;
};

type GitHubTree = {
  sha: string;
  url: string;
  tree: GitHubTreeItem[];
  truncated: boolean;
};

type GitHubIssue = {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: string;
  user: {
    login: string;
  } | null;
  labels: Array<{
    name: string;
    color: string;
  }>;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  pull_request?: {
    url: string;
  };
};

type GitHubComment = {
  id: number;
  body: string | null;
  user: {
    login: string;
  } | null;
  created_at: string;
  updated_at: string;
  issue_url: string;
};

type DemoRepoData = {
  repository: {
    id: string;
    owner: string;
    name: string;
    full_name: string;
    url: string;
    description?: string;
    default_branch?: string;
  };
  files: Array<{
    id: string;
    repo_id: string;
    path: string;
    size?: number;
    type?: string;
    sha?: string;
  }>;
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
    created_at: string;
    updated_at?: string;
    closed_at?: string;
  }>;
  comments: Array<{
    id: string;
    issue_id: string;
    body?: string;
    author?: string;
    created_at: string;
    updated_at?: string;
  }>;
};

class GitHubAPI {
  private baseUrl = "https://api.github.com";
  private token?: string;

  constructor(token?: string) {
    this.token = token;
  }

  private async request<T>(endpoint: string): Promise<T> {
    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
    };

    if (this.token) {
      headers["Authorization"] = `token ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, { headers });

    if (!response.ok) {
      let errorMessage = `GitHub API error: ${response.status} ${response.statusText}`;

      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // Ignore JSON parse errors
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }

  private async fetchAllPages<T>(
    endpoint: string,
    maxPages = 100
  ): Promise<T[]> {
    const results: T[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore && page <= maxPages) {
      const separator = endpoint.includes("?") ? "&" : "?";
      const data = await this.request<T[]>(
        `${endpoint}${separator}page=${page}&per_page=100`
      );

      if (data.length === 0) {
        hasMore = false;
      } else {
        results.push(...data);
        page++;
      }

      if (data.length < 100) {
        hasMore = false;
      }
    }

    return results;
  }

  async fetchRepository(owner: string, repo: string): Promise<GitHubRepo> {
    return this.request<GitHubRepo>(`/repos/${owner}/${repo}`);
  }

  async fetchRepositoryTree(
    owner: string,
    repo: string,
    branch?: string
  ): Promise<GitHubTreeItem[]> {
    const repoData = await this.fetchRepository(owner, repo);
    const targetBranch = branch || repoData.default_branch;

    const branchData = await this.request<{ commit: { sha: string } }>(
      `/repos/${owner}/${repo}/branches/${targetBranch}`
    );

    const tree = await this.request<GitHubTree>(
      `/repos/${owner}/${repo}/git/trees/${branchData.commit.sha}?recursive=1`
    );

    return tree.tree.filter((item) => item.type === "blob");
  }

  async fetchIssues(
    owner: string,
    repo: string,
    state: "open" | "closed" | "all" = "all"
  ): Promise<GitHubIssue[]> {
    return this.fetchAllPages<GitHubIssue>(
      `/repos/${owner}/${repo}/issues?state=${state}`
    );
  }

  async fetchAllIssueComments(
    owner: string,
    repo: string
  ): Promise<Map<number, GitHubComment[]>> {
    const allComments = await this.fetchAllPages<
      GitHubComment & { issue_url: string }
    >(`/repos/${owner}/${repo}/issues/comments`);

    const commentsByIssue = new Map<number, GitHubComment[]>();

    for (const comment of allComments) {
      const issueNumber = parseInt(comment.issue_url.split("/").pop() || "0");

      if (!commentsByIssue.has(issueNumber)) {
        commentsByIssue.set(issueNumber, []);
      }

      commentsByIssue.get(issueNumber)!.push(comment);
    }

    return commentsByIssue;
  }
}

function determineFileType(path: string): string {
  const ext = path.split(".").pop() || "";
  if (CODE_FILE_EXTENSIONS.includes(ext as any)) return FILE_TYPE_CODE;
  if (TEXT_FILE_EXTENSIONS.includes(ext as any)) return FILE_TYPE_TEXT;
  if (IMAGE_FILE_EXTENSIONS.includes(ext as any)) return FILE_TYPE_IMAGE;
  return FILE_TYPE_FILE;
}

async function fetchDemoRepoData(token?: string): Promise<DemoRepoData> {
  const github = new GitHubAPI(token);

  console.log(
    `Fetching repository metadata for ${DEMO_REPO_OWNER}/${DEMO_REPO_NAME}...`
  );
  const repoData = await github.fetchRepository(
    DEMO_REPO_OWNER,
    DEMO_REPO_NAME
  );
  const repoId = `${DEMO_REPO_ID_PREFIX}${repoData.id}`;

  console.log(`Fetching files...`);
  const treeItems = await github.fetchRepositoryTree(
    DEMO_REPO_OWNER,
    DEMO_REPO_NAME
  );

  console.log(`Fetching issues and pull requests...`);
  const issues = await github.fetchIssues(
    DEMO_REPO_OWNER,
    DEMO_REPO_NAME,
    "all"
  );

  console.log(`Fetching comments...`);
  const commentsByIssue = await github.fetchAllIssueComments(
    DEMO_REPO_OWNER,
    DEMO_REPO_NAME
  );

  const repository = {
    id: repoId,
    owner: repoData.owner.login,
    name: repoData.name,
    full_name: repoData.full_name,
    url: repoData.html_url,
    description: repoData.description || undefined,
    default_branch: repoData.default_branch,
  };

  const files = treeItems.map((item) => ({
    id: `${FILE_ID_PREFIX}${repoId}-${item.sha}`,
    repo_id: repoId,
    path: item.path,
    size: item.size,
    type: determineFileType(item.path),
    sha: item.sha,
  }));

  const issueRecords = issues.map((issue) => ({
    id: `${ISSUE_ID_PREFIX}${repoId}-${issue.id}`,
    repo_id: repoId,
    number: issue.number,
    title: issue.title,
    body: issue.body || undefined,
    state: issue.state,
    type: issue.pull_request ? ("pull_request" as const) : ("issue" as const),
    author: issue.user?.login,
    labels: issue.labels,
    created_at: issue.created_at,
    updated_at: issue.updated_at || undefined,
    closed_at: issue.closed_at || undefined,
  }));

  const comments: DemoRepoData["comments"] = [];
  for (const [issueNumber, commentsList] of commentsByIssue.entries()) {
    const issue = issueRecords.find((i) => i.number === issueNumber);
    if (!issue) continue;

    for (const comment of commentsList) {
      comments.push({
        id: `${COMMENT_ID_PREFIX}${repoId}-${comment.id}`,
        issue_id: issue.id,
        body: comment.body || undefined,
        author: comment.user?.login,
        created_at: comment.created_at,
        updated_at: comment.updated_at || undefined,
      });
    }
  }

  return {
    repository,
    files,
    issues: issueRecords,
    comments,
  };
}

async function main() {
  const token = process.env.GITHUB_TOKEN;

  try {
    console.log("Starting demo repository data fetch...");
    const data = await fetchDemoRepoData(token);

    const outputPath = join(__dirname, "../src/data/demo-repo.json");
    writeFileSync(outputPath, JSON.stringify(data, null, 2));

    console.log(`\n✅ Successfully fetched and saved demo repository data!`);
    console.log(`   Repository: ${data.repository.full_name}`);
    console.log(`   Files: ${data.files.length}`);
    console.log(
      `   Issues: ${data.issues.filter((i) => i.type === "issue").length}`
    );
    console.log(
      `   Pull Requests: ${
        data.issues.filter((i) => i.type === "pull_request").length
      }`
    );
    console.log(`   Comments: ${data.comments.length}`);
    console.log(`   Output: ${outputPath}`);
  } catch (error) {
    console.error("❌ Error fetching demo repository data:", error);
    process.exit(1);
  }
}

main();
