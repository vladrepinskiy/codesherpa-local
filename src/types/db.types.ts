export type Comment = {
  id: string;
  issue_id: string;
  body?: string;
  author?: string;
  created_at: Date;
  updated_at?: Date;
};

export type File = {
  id: string;
  repo_id: string;
  path: string;
  content?: string;
  size?: number;
  type?: string;
  sha?: string;
  last_modified?: Date;
};

export type Issue = {
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
};

export type Repository = {
  id: string;
  owner: string;
  name: string;
  full_name: string;
  url: string;
  description?: string;
  default_branch?: string;
  imported_at: Date;
};

export type InsertRepository = Omit<Repository, "imported_at">;

export type ImportStats = {
  filesCount: number;
  issuesCount: number;
  pullRequestsCount: number;
  commentsCount: number;
};
