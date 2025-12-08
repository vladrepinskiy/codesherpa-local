export type GitHubRepo = {
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

export type GitHubFile = {
  path: string;
  sha: string;
  size: number;
  type: "file" | "dir";
  content?: string;
};

export type GitHubIssue = {
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

export type GitHubComment = {
  id: number;
  body: string | null;
  user: {
    login: string;
  } | null;
  created_at: string;
  updated_at: string;
};

export type GitHubTreeItem = {
  path: string;
  mode: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
  url: string;
};

export type GitHubTree = {
  sha: string;
  url: string;
  tree: GitHubTreeItem[];
  truncated: boolean;
};
