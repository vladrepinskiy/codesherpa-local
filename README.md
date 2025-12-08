# CodeSherpa Local - GitHub Repository Importer

A client-side web application that imports GitHub repository data into a local PGLite database with IndexedDB persistence. Perfect for analyzing repositories offline or building tools that need access to repository data.

## Features

- ✅ **Fully Client-Side**: No backend required, runs entirely in your browser
- 💾 **Persistent Storage**: Data stored in IndexedDB, persists across sessions
- 🗄️ **PGLite Database**: PostgreSQL in the browser with full SQL support
- 📦 **Complete Import**: Fetches files, issues, pull requests, and comments
- 🔐 **Optional Authentication**: Works without a token, or use your own for higher rate limits
- 📊 **Import Statistics**: See what was imported with detailed counts

## What Gets Imported

1. **Repository Metadata**: Name, owner, description, default branch
2. **Files**: All file paths with metadata (size, type, SHA)
3. **Issues**: All issues with title, body, state, labels, timestamps
4. **Pull Requests**: Stored as a type of issue (following GitHub's API model)
5. **Comments**: All comments on issues and pull requests

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

## Usage

1. **Enter Repository URL**: Paste any public GitHub repository URL
   - Format: `https://github.com/owner/repository`
2. **Optional Token**: Click "Add GitHub Personal Access Token" to increase rate limits

   - Without token: 60 requests/hour
   - With token: 5,000 requests/hour
   - [Create a token](https://github.com/settings/tokens/new?scopes=public_repo&description=CodeSherpa%20Local)

3. **Import**: Click "Import Repository" and watch the progress

4. **Results**: View statistics about imported data

## GitHub API Rate Limits

- **Unauthenticated**: 60 requests per hour per IP address
- **Authenticated**: 5,000 requests per hour

For larger repositories, a personal access token is recommended.

## Technology Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **PGLite** - PostgreSQL database in the browser
- **IndexedDB** - Persistent storage
- **GitHub REST API** - Data source

## Project Structure

```
src/
├── components/          # React components
│   ├── ImportForm.tsx
│   ├── ImportProgress.tsx
│   ├── ImportStats.tsx
│   └── ErrorDisplay.tsx
├── services/           # Core services
│   ├── db.ts          # PGLite database service
│   ├── github.ts      # GitHub API client
│   └── importer.ts    # Import orchestration
├── App.tsx            # Main application
└── main.tsx           # Entry point
```

## Future Enhancements

- Browse imported files
- Search through issues and comments
- View file content on-demand
- Export data to JSON/CSV
- Compare multiple repositories
- Visualize repository statistics

## License

MIT

## Deployment

This app is designed to be deployed as a static site. It works great with:

- GitHub Pages
- Vercel
- Netlify
- Any static hosting service

Simply build and deploy the `dist` folder.
