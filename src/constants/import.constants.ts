export const CODE_FILE_EXTENSIONS = [
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
] as const;

export const TEXT_FILE_EXTENSIONS = [
  "md",
  "txt",
  "json",
  "yaml",
  "yml",
  "xml",
  "html",
  "css",
  "log",
] as const;

export const IMAGE_FILE_EXTENSIONS = [
  "png",
  "jpg",
  "jpeg",
  "gif",
  "svg",
  "ico",
] as const;

export const FILE_BATCH_SIZE = 50 as const;

export const ISSUE_BATCH_SIZE = 25 as const;

export const TOTAL_IMPORT_STEPS = 5 as const;

export const REPO_ID_PREFIX = "github-" as const;

export const DEMO_REPO_ID_PREFIX = "demo-" as const;

export const FILE_ID_PREFIX = "file-" as const;

export const ISSUE_ID_PREFIX = "issue-" as const;

export const COMMENT_ID_PREFIX = "comment-" as const;

export const FILE_TYPE_CODE = "code" as const;

export const FILE_TYPE_TEXT = "text" as const;

export const FILE_TYPE_IMAGE = "image" as const;

export const FILE_TYPE_FILE = "file" as const;

export const ERROR_MESSAGE_UNKNOWN = "Unknown error occurred";

export const ERROR_MESSAGE_INVALID_URL = "Invalid GitHub repository URL";

export const ERROR_MESSAGE_REPO_NOT_FOUND =
  "Repository not found. Please check the URL and make sure the repository is public.";
