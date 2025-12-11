# CodeSherpa Local - GitHub Repository Importer

A client-side web application that imports GitHub repository data into a local PGLite database with IndexedDB persistence. Perfect for analyzing repositories offline or building tools that need access to repository data.

## Features

- ✅ **Fully Client-Side**: No backend required, runs entirely in your browser
- 💾 **Persistent Storage**: Data stored in IndexedDB, persists across sessions
- 🔐 **Optional Authentication**: Works without a token, or use your own for higher rate limits

## Stack

- **React**, **TypeScript**, **Vite**
- **PGLite** - PostgreSQL database in the browser
- **GitHub REST API** - Data source
- **WebLLM** - Local LLM inference in the browser
- **Wouter** - Lightweight routing
- **Goober** - CSS-in-JS styling
- **Sonner** - Toast notifications

## Database Schema

### Tables

- `repositories`: Repository metadata (id, owner, name, full_name, url, description, default_branch, status, imported_at)
- `files`: File paths and metadata (id, repo_id, path, content, size, type, sha, last_modified)
- `issues`: Issues and pull requests with full details (id, repo_id, number, title, body, state, type, author, labels, created_at, updated_at, closed_at)
- `comments`: Comments associated with issues/PRs (id, issue_id, body, author, created_at, updated_at)
- `chats`: Chat sessions for repository conversations (id, title, repo_id, created_at, updated_at)
- `messages`: Chat messages (id, chat_id, role, content, status, created_at, updated_at)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (or Node.js with npm/yarn)

### Installation

```bash
# Install dependencies
bun install

# Start development server
bun run dev
```

Visit `http://localhost:3000` in your browser.

### Building for Production

```bash
# Build for production
bun run build

# Preview production build
bun run preview
```

### Database REPL

Press `Cmd+Shift+D` (Mac) or `Ctrl+Shift+D` (Windows/Linux) to open an interactive SQL terminal. Query your imported data directly:

```sql
SELECT * FROM repositories;
SELECT path, size FROM files WHERE repo_id = '...' ORDER BY size DESC;
SELECT title, state, type FROM issues WHERE repo_id = '...';
```

## GitHub API Rate Limits

- **Unauthenticated**: 60 requests per hour per IP address
- **Authenticated**: 5,000 requests per hour

For larger repositories, a personal access token is recommended.

## Deployment

The app is configured for GitHub Pages deployment with base path `/codesherpa-local/`. The build output in `dist/` can be deployed to any static hosting service (GitHub Pages, Vercel, Netlify, etc.).
