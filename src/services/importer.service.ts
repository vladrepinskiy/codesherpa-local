import {
  CODE_FILE_EXTENSIONS,
  COMMENT_ID_PREFIX,
  ERROR_MESSAGE_INVALID_URL,
  ERROR_MESSAGE_REPO_NOT_FOUND,
  ERROR_MESSAGE_UNKNOWN,
  FILE_BATCH_SIZE,
  FILE_ID_PREFIX,
  FILE_TYPE_CODE,
  FILE_TYPE_FILE,
  FILE_TYPE_IMAGE,
  FILE_TYPE_TEXT,
  IMAGE_FILE_EXTENSIONS,
  ISSUE_BATCH_SIZE,
  ISSUE_ID_PREFIX,
  REPO_ID_PREFIX,
  TEXT_FILE_EXTENSIONS,
  TOTAL_IMPORT_STEPS,
} from "../constants/import.constants";
import { GitHubAPIError } from "../error/githubapi.error";
import type { ImportResult, ProgressCallback } from "../types/import.types";
import { getRepositories, initDatabase } from "../util/db.util";
import { GitHubAPI } from "./github.service";

export class RepositoryImporter {
  private github: GitHubAPI;
  private onProgress?: ProgressCallback;

  constructor(token?: string, onProgress?: ProgressCallback) {
    this.github = new GitHubAPI(token);
    this.onProgress = onProgress;
  }

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

  private determineFileType(path: string): string {
    const ext = path.split(".").pop() || "";
    if (CODE_FILE_EXTENSIONS.includes(ext as any)) return FILE_TYPE_CODE;
    if (TEXT_FILE_EXTENSIONS.includes(ext as any)) return FILE_TYPE_TEXT;
    if (IMAGE_FILE_EXTENSIONS.includes(ext as any)) return FILE_TYPE_IMAGE;
    return FILE_TYPE_FILE;
  }

  private async importMetadata(
    owner: string,
    repo: string
  ): Promise<{ repoId: string }> {
    this.reportProgress(
      "metadata",
      1,
      TOTAL_IMPORT_STEPS,
      `Fetching repository metadata for ${owner}/${repo}...`
    );
    const repoData = await this.github.fetchRepository(owner, repo);
    const repoId = `${REPO_ID_PREFIX}${repoData.id}`;

    const { repositoriesRepository } = getRepositories();
    await repositoriesRepository.insertRepository({
      id: repoId,
      owner: repoData.owner.login,
      name: repoData.name,
      full_name: repoData.full_name,
      url: repoData.html_url,
      description: repoData.description || undefined,
      default_branch: repoData.default_branch,
    });

    return { repoId };
  }

  private async importFiles(
    owner: string,
    repo: string,
    repoId: string
  ): Promise<void> {
    this.reportProgress(
      "files",
      2,
      TOTAL_IMPORT_STEPS,
      "Fetching repository files..."
    );
    const treeItems = await this.github.fetchRepositoryTree(owner, repo);

    this.reportProgress(
      "files",
      2,
      TOTAL_IMPORT_STEPS,
      `Importing ${treeItems.length} files...`
    );

    let processedFiles = 0;

    for (let i = 0; i < treeItems.length; i += FILE_BATCH_SIZE) {
      const batch = treeItems.slice(i, i + FILE_BATCH_SIZE);
      const fileRecords = batch.map((item) => ({
        id: `${FILE_ID_PREFIX}${repoId}-${item.sha}`,
        repo_id: repoId,
        path: item.path,
        size: item.size,
        type: this.determineFileType(item.path),
        sha: item.sha,
        content: undefined,
      }));

      const { filesRepository } = getRepositories();
      await filesRepository.insertFiles(fileRecords);
      processedFiles += batch.length;
      this.reportProgress(
        "files",
        2,
        TOTAL_IMPORT_STEPS,
        `Imported ${processedFiles}/${treeItems.length} files...`
      );
    }
  }

  private async importIssues(
    owner: string,
    repo: string,
    repoId: string
  ): Promise<Array<{ id: string; number: number }>> {
    this.reportProgress(
      "issues",
      3,
      TOTAL_IMPORT_STEPS,
      "Fetching issues and pull requests..."
    );
    const issues = await this.github.fetchIssues(owner, repo, "all");

    this.reportProgress(
      "issues",
      3,
      TOTAL_IMPORT_STEPS,
      `Importing ${issues.length} issues and pull requests...`
    );

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
      created_at: new Date(issue.created_at),
      updated_at: issue.updated_at ? new Date(issue.updated_at) : undefined,
      closed_at: issue.closed_at ? new Date(issue.closed_at) : undefined,
    }));

    const { issuesRepository } = getRepositories();
    for (let i = 0; i < issueRecords.length; i += ISSUE_BATCH_SIZE) {
      const batch = issueRecords.slice(i, i + ISSUE_BATCH_SIZE);
      await issuesRepository.insertIssues(batch);
      this.reportProgress(
        "issues",
        3,
        TOTAL_IMPORT_STEPS,
        `Imported ${Math.min(i + ISSUE_BATCH_SIZE, issueRecords.length)}/${
          issueRecords.length
        } issues...`
      );
    }

    return issueRecords.map((issue) => ({
      id: issue.id,
      number: issue.number,
    }));
  }

  private async importComments(
    owner: string,
    repo: string,
    repoId: string,
    issueRecords: Array<{ id: string; number: number }>
  ): Promise<void> {
    this.reportProgress(
      "comments",
      4,
      TOTAL_IMPORT_STEPS,
      "Fetching comments..."
    );
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
      TOTAL_IMPORT_STEPS,
      `Importing ${totalComments} comments...`
    );

    let processedComments = 0;
    for (const [issueNumber, comments] of commentsByIssue.entries()) {
      const issue = issueRecords.find((i) => i.number === issueNumber);
      if (!issue) continue;

      const commentRecords = comments.map((comment) => ({
        id: `${COMMENT_ID_PREFIX}${repoId}-${comment.id}`,
        issue_id: issue.id,
        body: comment.body || undefined,
        author: comment.user?.login,
        created_at: new Date(comment.created_at),
        updated_at: comment.updated_at
          ? new Date(comment.updated_at)
          : undefined,
      }));

      const { commentsRepository } = getRepositories();
      await commentsRepository.insertComments(commentRecords);
      processedComments += comments.length;
      this.reportProgress(
        "comments",
        4,
        TOTAL_IMPORT_STEPS,
        `Imported ${processedComments}/${totalComments} comments...`
      );
    }
  }

  private async getStatistics(repoId: string) {
    this.reportProgress(
      "complete",
      TOTAL_IMPORT_STEPS,
      TOTAL_IMPORT_STEPS,
      "Import complete! Gathering statistics..."
    );
    const { repositoriesRepository } = getRepositories();
    return await repositoriesRepository.getImportStats(repoId);
  }

  private handleImportError(error: unknown): ImportResult {
    console.error("Import error:", error);

    let errorMessage = ERROR_MESSAGE_UNKNOWN;

    if (error instanceof GitHubAPIError) {
      errorMessage = error.message;
      if (error.statusCode === 404) {
        errorMessage = ERROR_MESSAGE_REPO_NOT_FOUND;
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

  async importRepository(repoUrl: string): Promise<ImportResult> {
    try {
      await initDatabase();
      this.reportProgress(
        "init",
        0,
        TOTAL_IMPORT_STEPS,
        "Initializing database..."
      );

      const parsed = this.github.parseRepoUrl(repoUrl);
      if (!parsed) {
        throw new Error(ERROR_MESSAGE_INVALID_URL);
      }

      const { owner, repo } = parsed;
      const { repoId } = await this.importMetadata(owner, repo);
      await this.importFiles(owner, repo, repoId);
      const issueRecords = await this.importIssues(owner, repo, repoId);
      await this.importComments(owner, repo, repoId, issueRecords);
      const stats = await this.getStatistics(repoId);

      return {
        success: true,
        repoId,
        stats,
      };
    } catch (error) {
      return this.handleImportError(error);
    }
  }
}
