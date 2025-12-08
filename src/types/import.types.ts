export type ImportProgressData = {
  step: string;
  current: number;
  total: number;
  message: string;
};

export type ImportResult = {
  success: boolean;
  repoId: string;
  stats: {
    filesCount: number;
    issuesCount: number;
    pullRequestsCount: number;
    commentsCount: number;
  };
  error?: string;
};

export type ProgressCallback = (progress: ImportProgressData) => void;

export type ImportState =
  | { status: "idle" }
  | { status: "importing"; progress: ImportProgressData }
  | { status: "success"; result: ImportResult }
  | { status: "error"; error: string };
