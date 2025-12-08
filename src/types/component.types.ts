import type { ImportProgressData } from "./import.types";

export type ErrorDisplayProps = {
  title: string;
  icon?: string;
  children: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
};

export type ImportFormProps = {
  onImport: (repoUrl: string, token?: string) => void;
  isImporting: boolean;
};

export type ImportProgressProps = {
  progress: ImportProgressData;
};

export type ImportStatsProps = {
  stats: {
    filesCount: number;
    issuesCount: number;
    pullRequestsCount: number;
    commentsCount: number;
  };
  repoName?: string;
  onReset: () => void;
};

export type ImportErrorDisplayProps = {
  error: string;
  onReset: () => void;
};
