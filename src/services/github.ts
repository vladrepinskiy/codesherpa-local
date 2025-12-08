import type {
  GitHubRepo,
  GitHubIssue,
  GitHubComment,
  GitHubTreeItem,
  GitHubTree,
} from "../types/github.types";

export class GitHubAPIError extends Error {
  statusCode?: number;
  rateLimitRemaining?: number;
  rateLimitReset?: number;

  constructor(
    message: string,
    statusCode?: number,
    rateLimitRemaining?: number,
    rateLimitReset?: number
  ) {
    super(message);
    this.name = "GitHubAPIError";
    this.statusCode = statusCode;
    this.rateLimitRemaining = rateLimitRemaining;
    this.rateLimitReset = rateLimitReset;
  }
}

export class GitHubAPI {
  private baseUrl = "https://api.github.com";
  private token?: string;

  constructor(token?: string) {
    this.token = token;
  }

  /**
   * Make a request to the GitHub API
   */
  private async request<T>(endpoint: string): Promise<T> {
    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
    };

    if (this.token) {
      headers["Authorization"] = `token ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, { headers });

    // Check rate limit
    const rateLimitRemaining = response.headers.get("x-ratelimit-remaining");
    const rateLimitReset = response.headers.get("x-ratelimit-reset");

    console.log("rateLimitRemaining", rateLimitRemaining);
    console.log("rateLimitReset", rateLimitReset);

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

      throw new GitHubAPIError(
        errorMessage,
        response.status,
        rateLimitRemaining ? parseInt(rateLimitRemaining) : undefined,
        rateLimitReset ? parseInt(rateLimitReset) : undefined
      );
    }

    return response.json();
  }

  /**
   * Fetch all pages of a paginated endpoint
   */
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

      // If we got less than 100 items, we've reached the end
      if (data.length < 100) {
        hasMore = false;
      }
    }

    return results;
  }

  /**
   * Parse a GitHub repository URL
   */
  parseRepoUrl(url: string): { owner: string; repo: string } | null {
    // Handle various GitHub URL formats
    const patterns = [
      /github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?$/, // https://github.com/owner/repo or https://github.com/owner/repo.git
      /github\.com\/([^\/]+)\/([^\/]+)/, // https://github.com/owner/repo/...
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return { owner: match[1], repo: match[2] };
      }
    }

    return null;
  }

  /**
   * Fetch repository metadata
   */
  async fetchRepository(owner: string, repo: string): Promise<GitHubRepo> {
    return this.request<GitHubRepo>(`/repos/${owner}/${repo}`);
  }

  /**
   * Fetch the entire repository tree recursively
   */
  async fetchRepositoryTree(
    owner: string,
    repo: string,
    branch?: string
  ): Promise<GitHubTreeItem[]> {
    // First, get the repository to find the default branch if not provided
    const repoData = await this.fetchRepository(owner, repo);
    const targetBranch = branch || repoData.default_branch;

    // Get the SHA of the latest commit on the branch
    const branchData = await this.request<{ commit: { sha: string } }>(
      `/repos/${owner}/${repo}/branches/${targetBranch}`
    );

    // Fetch the tree recursively
    const tree = await this.request<GitHubTree>(
      `/repos/${owner}/${repo}/git/trees/${branchData.commit.sha}?recursive=1`
    );

    // Filter to only include files (blobs), not directories
    return tree.tree.filter((item) => item.type === "blob");
  }

  /**
   * Fetch file content
   */
  async fetchFileContent(
    owner: string,
    repo: string,
    path: string,
    ref?: string
  ): Promise<string> {
    const refParam = ref ? `?ref=${ref}` : "";
    const response = await this.request<{
      content: string;
      encoding: string;
    }>(`/repos/${owner}/${repo}/contents/${path}${refParam}`);

    // GitHub returns base64 encoded content
    if (response.encoding === "base64") {
      return atob(response.content.replace(/\n/g, ""));
    }

    return response.content;
  }

  /**
   * Fetch all issues (including pull requests)
   */
  async fetchIssues(
    owner: string,
    repo: string,
    state: "open" | "closed" | "all" = "all"
  ): Promise<GitHubIssue[]> {
    return this.fetchAllPages<GitHubIssue>(
      `/repos/${owner}/${repo}/issues?state=${state}`
    );
  }

  /**
   * Fetch comments for a specific issue
   */
  async fetchIssueComments(
    owner: string,
    repo: string,
    issueNumber: number
  ): Promise<GitHubComment[]> {
    return this.fetchAllPages<GitHubComment>(
      `/repos/${owner}/${repo}/issues/${issueNumber}/comments`
    );
  }

  /**
   * Fetch comments for all issues
   */
  async fetchAllIssueComments(
    owner: string,
    repo: string
  ): Promise<Map<number, GitHubComment[]>> {
    // Fetch all comments at once (more efficient than per-issue)
    const allComments = await this.fetchAllPages<
      GitHubComment & { issue_url: string }
    >(`/repos/${owner}/${repo}/issues/comments`);

    // Group comments by issue number
    const commentsByIssue = new Map<number, GitHubComment[]>();

    for (const comment of allComments) {
      // Extract issue number from issue_url (e.g., "https://api.github.com/repos/owner/repo/issues/123")
      const issueNumber = parseInt(comment.issue_url.split("/").pop() || "0");

      if (!commentsByIssue.has(issueNumber)) {
        commentsByIssue.set(issueNumber, []);
      }

      commentsByIssue.get(issueNumber)!.push(comment);
    }

    return commentsByIssue;
  }

  /**
   * Check rate limit status
   */
  async checkRateLimit(): Promise<{
    limit: number;
    remaining: number;
    reset: Date;
  }> {
    const data = await this.request<{
      rate: {
        limit: number;
        remaining: number;
        reset: number;
      };
    }>("/rate_limit");

    return {
      limit: data.rate.limit,
      remaining: data.rate.remaining,
      reset: new Date(data.rate.reset * 1000),
    };
  }
}
