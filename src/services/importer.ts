import type { ImportResult, ProgressCallback } from "../types/import.types";
import {
  getImportStats,
  initDatabase,
  insertComments,
  insertFiles,
  insertIssues,
  insertRepository,
} from "./db";
import { GitHubAPI, GitHubAPIError } from "./github";

/**
 * Import a GitHub repository into the database
 */
export class RepositoryImporter {
  private github: GitHubAPI;
  private onProgress?: ProgressCallback;

  constructor(token?: string, onProgress?: ProgressCallback) {
    this.github = new GitHubAPI(token);
    this.onProgress = onProgress;
  }

  /**
   * Report progress
   */
  private reportProgress(
    step: string,
    current: number,
    total: number,
    message: string
  ) {
    if (this.onProgress) {
      this.onProgress({ step, current, total, message });
    }
  }

  /**
   * Import a repository from a GitHub URL
   */
  async importRepository(repoUrl: string): Promise<ImportResult> {
    try {
      // Initialize database
      await initDatabase();
      this.reportProgress("init", 0, 5, "Initializing database...");

      // Parse repository URL
      const parsed = this.github.parseRepoUrl(repoUrl);
      if (!parsed) {
        throw new Error("Invalid GitHub repository URL");
      }

      const { owner, repo } = parsed;

      // Step 1: Fetch repository metadata
      this.reportProgress(
        "metadata",
        1,
        5,
        `Fetching repository metadata for ${owner}/${repo}...`
      );
      const repoData = await this.github.fetchRepository(owner, repo);

      const repoId = `github-${repoData.id}`;

      // Insert repository
      await insertRepository({
        id: repoId,
        owner: repoData.owner.login,
        name: repoData.name,
        full_name: repoData.full_name,
        url: repoData.html_url,
        description: repoData.description || undefined,
        default_branch: repoData.default_branch,
      });

      // Step 2: Fetch and import files
      this.reportProgress("files", 2, 5, "Fetching repository files...");
      const treeItems = await this.github.fetchRepositoryTree(owner, repo);

      this.reportProgress(
        "files",
        2,
        5,
        `Importing ${treeItems.length} files...`
      );

      // Process files in batches to avoid overwhelming the database
      const BATCH_SIZE = 50;
      const fileBatches: (typeof treeItems)[] = [];

      for (let i = 0; i < treeItems.length; i += BATCH_SIZE) {
        fileBatches.push(treeItems.slice(i, i + BATCH_SIZE));
      }

      let processedFiles = 0;
      for (const batch of fileBatches) {
        const fileRecords = batch.map((item) => {
          // Determine file type based on extension
          const ext = item.path.split(".").pop() || "";
          let fileType = "file";

          // Common code file extensions
          if (
            [
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
            ].includes(ext)
          ) {
            fileType = "code";
          } else if (
            ["md", "txt", "json", "yaml", "yml", "xml", "html", "css"].includes(
              ext
            )
          ) {
            fileType = "text";
          } else if (
            ["png", "jpg", "jpeg", "gif", "svg", "ico"].includes(ext)
          ) {
            fileType = "image";
          }

          return {
            id: `file-${repoId}-${item.sha}`,
            repo_id: repoId,
            path: item.path,
            size: item.size,
            type: fileType,
            sha: item.sha,
            // We don't fetch content here to save API calls - can be fetched on demand
            content: undefined,
          };
        });

        await insertFiles(fileRecords);
        processedFiles += batch.length;
        this.reportProgress(
          "files",
          2,
          5,
          `Imported ${processedFiles}/${treeItems.length} files...`
        );
      }

      // Step 3: Fetch and import issues (including PRs)
      this.reportProgress(
        "issues",
        3,
        5,
        "Fetching issues and pull requests..."
      );
      const issues = await this.github.fetchIssues(owner, repo, "all");

      this.reportProgress(
        "issues",
        3,
        5,
        `Importing ${issues.length} issues and pull requests...`
      );

      const issueRecords = issues.map((issue) => ({
        id: `issue-${repoId}-${issue.id}`,
        repo_id: repoId,
        number: issue.number,
        title: issue.title,
        body: issue.body || undefined,
        state: issue.state,
        type: issue.pull_request
          ? ("pull_request" as const)
          : ("issue" as const),
        author: issue.user?.login,
        labels: issue.labels,
        created_at: new Date(issue.created_at),
        updated_at: issue.updated_at ? new Date(issue.updated_at) : undefined,
        closed_at: issue.closed_at ? new Date(issue.closed_at) : undefined,
      }));

      // Process issues in batches
      const ISSUE_BATCH_SIZE = 25;
      for (let i = 0; i < issueRecords.length; i += ISSUE_BATCH_SIZE) {
        const batch = issueRecords.slice(i, i + ISSUE_BATCH_SIZE);
        await insertIssues(batch);
        this.reportProgress(
          "issues",
          3,
          5,
          `Imported ${Math.min(i + ISSUE_BATCH_SIZE, issueRecords.length)}/${
            issueRecords.length
          } issues...`
        );
      }

      // Step 4: Fetch and import comments
      this.reportProgress("comments", 4, 5, "Fetching comments...");
      const commentsByIssue = await this.github.fetchAllIssueComments(
        owner,
        repo
      );

      const totalComments = Array.from(commentsByIssue.values()).reduce(
        (sum, comments) => sum + comments.length,
        0
      );
      this.reportProgress(
        "comments",
        4,
        5,
        `Importing ${totalComments} comments...`
      );

      let processedComments = 0;
      for (const [issueNumber, comments] of commentsByIssue.entries()) {
        // Find the issue ID from our imported issues
        const issue = issueRecords.find((i) => i.number === issueNumber);
        if (!issue) continue;

        const commentRecords = comments.map((comment) => ({
          id: `comment-${repoId}-${comment.id}`,
          issue_id: issue.id,
          body: comment.body || undefined,
          author: comment.user?.login,
          created_at: new Date(comment.created_at),
          updated_at: comment.updated_at
            ? new Date(comment.updated_at)
            : undefined,
        }));

        await insertComments(commentRecords);
        processedComments += comments.length;
        this.reportProgress(
          "comments",
          4,
          5,
          `Imported ${processedComments}/${totalComments} comments...`
        );
      }

      // Step 5: Get final statistics
      this.reportProgress(
        "complete",
        5,
        5,
        "Import complete! Gathering statistics..."
      );
      const stats = await getImportStats(repoId);

      return {
        success: true,
        repoId,
        stats,
      };
    } catch (error) {
      console.error("Import error:", error);

      let errorMessage = "Unknown error occurred";

      if (error instanceof GitHubAPIError) {
        errorMessage = error.message;
        if (error.statusCode === 404) {
          errorMessage =
            "Repository not found. Please check the URL and make sure the repository is public.";
        } else if (error.statusCode === 403 && error.rateLimitRemaining === 0) {
          const resetDate = error.rateLimitReset
            ? new Date(error.rateLimitReset * 1000).toLocaleTimeString()
            : "soon";
          errorMessage = `GitHub API rate limit exceeded. Limit will reset at ${resetDate}. Consider providing a personal access token.`;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      return {
        success: false,
        repoId: "",
        stats: {
          filesCount: 0,
          issuesCount: 0,
          pullRequestsCount: 0,
          commentsCount: 0,
        },
        error: errorMessage,
      };
    }
  }
}
