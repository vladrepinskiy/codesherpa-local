export class GitHubAPIError extends Error {
  statusCode?: number;
  rateLimitRemaining?: number;
  rateLimitReset?: number;

  constructor(
    message: string,
    statusCode?: number,
    rateLimitRemaining?: number,
    rateLimitReset?: number
  ) {
    super(message);
    this.name = "GitHubAPIError";
    this.statusCode = statusCode;
    this.rateLimitRemaining = rateLimitRemaining;
    this.rateLimitReset = rateLimitReset;
  }
}
