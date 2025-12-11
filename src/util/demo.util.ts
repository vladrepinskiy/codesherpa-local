import { DEMO_REPO_ID_PREFIX } from "../constants/import.constants";
import type { Comment, File, Issue } from "../types/db.types";
import type { DemoRepoData } from "../types/demo.types";
import { getDatabase, getRepositories } from "./db.util";

async function loadDemoRepoData(): Promise<DemoRepoData> {
  try {
    const data = (await import("../data/demo-repo.json")) as DemoRepoData;

    return data;
  } catch (error) {
    throw new Error(
      `Failed to load demo repo data: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function importDemoRepository(): Promise<void> {
  try {
    getDatabase();
    const { repositoriesRepository } = getRepositories();

    const allRepos = await repositoriesRepository.getAllRepositories();
    const hasDemoRepo = allRepos.some((repo) =>
      repo.id.startsWith(DEMO_REPO_ID_PREFIX)
    );

    if (hasDemoRepo) return;

    const data = await loadDemoRepoData();

    await repositoriesRepository.insertRepository(data.repository);

    const { filesRepository, issuesRepository, commentsRepository } =
      getRepositories();

    const fileRecords: File[] = data.files.map((file) => ({
      ...file,
      content: undefined,
      last_modified: undefined,
    }));

    await filesRepository.insertFiles(fileRecords);

    const issueRecords: Issue[] = data.issues.map((issue) => ({
      id: issue.id,
      repo_id: issue.repo_id,
      number: issue.number,
      title: issue.title,
      body: issue.body,
      state: issue.state,
      type: issue.type,
      author: issue.author,
      labels: issue.labels,
      created_at: new Date(issue.created_at),
      updated_at: issue.updated_at ? new Date(issue.updated_at) : undefined,
      closed_at: issue.closed_at ? new Date(issue.closed_at) : undefined,
    }));

    await issuesRepository.insertIssues(issueRecords);

    const commentRecords: Comment[] = data.comments.map((comment) => ({
      ...comment,
      created_at: new Date(comment.created_at),
      updated_at: comment.updated_at ? new Date(comment.updated_at) : undefined,
    }));

    console.log(`Importing ${commentRecords.length} comments...`);
    console.log(`Sample comment issue_id: ${commentRecords[0]?.issue_id}`);

    // Verify that the issue exists before inserting comments
    const sampleIssueId = commentRecords[0]?.issue_id;
    if (sampleIssueId) {
      const issue = await issuesRepository.readById(sampleIssueId);
      console.log(`Sample issue exists: ${issue ? "yes" : "no"}`);
      if (!issue) {
        console.error(
          `Issue ${sampleIssueId} not found! Comments cannot be inserted.`
        );
      }
    }

    await commentsRepository.insertComments(commentRecords);
    console.log(`Successfully imported ${commentRecords.length} comments`);
  } catch (error) {
    console.error("Failed to import demo repository:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message, error.stack);
    }
    throw error;
  }
}
