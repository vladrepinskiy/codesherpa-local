# CodeSherpa Local - GitHub Repository Importer

A client-side web application that imports GitHub repository data into a local PGLite database with IndexedDB persistence. Perfect for analyzing repositories offline or building tools that need access to repository data.

## Features

- ✅ **Fully Client-Side**: No backend required, runs entirely in your browser
- 💾 **Persistent Storage**: Data stored in IndexedDB, persists across sessions
- 🔐 **Optional Authentication**: Works without a token, or use your own for higher rate limits

## Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **PGLite** - PostgreSQL database in the browser
- **IndexedDB** - Persistent storage
- **GitHub REST API** - Data source

## Database Schema

### Tables

- `repositories`: Repository metadata
- `files`: File paths and metadata (content can be fetched on-demand)
- `issues`: Issues and pull requests with full details
- `comments`: Comments associated with issues/PRs

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

Visit `http://localhost:5173` in your browser.

### Building for Production

```bash
# Build for production
bun run build

# Preview production build
bun run preview
```

## GitHub API Rate Limits

- **Unauthenticated**: 60 requests per hour per IP address
- **Authenticated**: 5,000 requests per hour

For larger repositories, a personal access token is recommended.
