import { REPOSITORY_IMPORT_STATUS } from "../constants/import.constants";
import type { ValueOf } from "./util.types";

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

export type RepositoryImportStatus = ValueOf<typeof REPOSITORY_IMPORT_STATUS>;

export type Repository = {
  id: string;
  owner: string;
  name: string;
  full_name: string;
  url: string;
  description?: string;
  default_branch?: string;
  status: RepositoryImportStatus;
  imported_at: Date;
};

export type InsertRepository = Omit<Repository, "imported_at">;

export type ImportStats = {
  filesCount: number;
  issuesCount: number;
  pullRequestsCount: number;
  commentsCount: number;
};

const MESSAGE_STATUS = {
  COMPLETE: "complete",
  STREAMING: "streaming",
  INTERRUPTED: "interrupted",
} as const;

export type MessageStatus = ValueOf<typeof MESSAGE_STATUS>;

export type Chat = {
  id: string;
  title?: string;
  repo_id: string;
  created_at: Date;
  updated_at: Date;
};

export type Message = {
  id: string;
  chat_id: string;
  role: "user" | "assistant";
  content: string;
  status: MessageStatus;
  created_at: Date;
  updated_at: Date;
};
