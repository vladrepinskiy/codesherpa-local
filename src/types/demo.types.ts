import type { File, InsertRepository } from "./db.types";

export type SerializedIssue = {
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
};

export type SerializedComment = {
  id: string;
  issue_id: string;
  body?: string;
  author?: string;
  created_at: string;
  updated_at?: string;
};

export type DemoRepoData = {
  repository: InsertRepository;
  files: Omit<File, "content" | "last_modified">[];
  issues: SerializedIssue[];
  comments: SerializedComment[];
};
