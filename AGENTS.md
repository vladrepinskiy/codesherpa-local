# CodeSherpa Local - Agent Notes

## General Rules

### Code Comments

- **Prefer clear naming over comments**: Make function, component, and variable names precise and self-documenting
- **Avoid JSDoc comments**: Only add comments for lower-level, less obvious solutions or complex logic
- **No obvious comments**: Don't comment what the code clearly shows (e.g., `// Set state to idle`)
- **Comment the "why" not the "what"**: If a comment is needed, explain reasoning or non-obvious implementation details

### Documentation Maintenance

- **Update AGENTS.md after large changes**: When introducing new dependencies, features, or altering project structure
- **Document architectural decisions**: New patterns, directory changes, or significant refactors
- **Keep it concise**: Focus on decisions and preferences, not implementation details

## What We Built

A client-side GitHub repository importer that fetches repository data (files, issues, PRs, comments) via GitHub API and stores it in a PGLite database persisted to IndexedDB.

### Core Features

- **PGLite Database**: PostgreSQL in the browser with IndexedDB persistence
- **GitHub API Integration**: Fetches repository metadata, files, issues, PRs, and comments
- **Import Orchestration**: Progress tracking with 5-step import process
- **Database REPL**: Interactive SQL terminal (Cmd+Shift+D) for querying imported data
- **Fully Client-Side**: No backend required, works as static site (GitHub Pages ready)

## Architecture Decisions

### Database Schema

- **repositories**: Repository metadata
- **files**: File paths and metadata (content optional, can be fetched on-demand)
- **issues**: Single table for both Issues and PRs (type field: 'issue' | 'pull_request')
- **comments**: Separate normalized table for all comments

### Component Organization

```
src/
├── components/
│   ├── core/           # Reusable components (ErrorDisplay, DatabaseRepl)
│   └── import/         # Import-specific components
├── services/           # Business logic (db, github, importer)
└── types/              # Type definitions organized by domain
    ├── github.types.ts
    ├── import.types.ts
    └── component.types.ts
```

### Code Style Preferences

**Use `type` instead of `interface`**

- All type definitions use `type` syntax
- Types organized in semantic files under `src/types/`
- Component prop types in `component.types.ts`

**Component Syntax**

- All components use `const` arrow function syntax
- Named exports only (no default exports)
- Styled components placed below main component in same file

**Styling**

- Use `goober` for CSS-in-JS
- Configured to filter props starting with `$` (transient props)
- Setup in `main.tsx`: `setup(React.createElement, undefined, undefined, (props) => { ... })`

**Example Component Structure:**

```tsx
import { styled } from "goober";
import type { ComponentProps } from "../../types/component.types";

export const MyComponent = ({ prop1, prop2 }: ComponentProps) => {
  return <Container>...</Container>;
};

const Container = styled("div")`
  /* styles */
`;
```

## Key Implementation Details

### PGLite Configuration

- Excluded from Vite optimization: `optimizeDeps: { exclude: ["@electric-sql/pglite"] }`
- Initialized with `waitReady` before use
- Database instance stored in module-level variable

### GitHub API

- Works without authentication (60 req/hour limit)
- Optional user-provided token for higher limits (5000 req/hour)
- Handles pagination automatically
- Unified issues/PRs (PRs are a type of Issue in GitHub API)

### Database REPL

- Keyboard shortcut: Cmd+Shift+D (Mac) or Ctrl+Shift+D (Windows/Linux)
- Bottom panel: 30% viewport height, full width
- No visible UI - completely hidden until activated
- Auto-initializes database if needed

### Import Process

1. Fetch repository metadata
2. Import files (batched for performance)
3. Import issues and pull requests
4. Import comments
5. Display statistics

### Page Navigation Warning

- Warns user if they try to refresh/close during import
- Uses `beforeunload` event listener
- Only active when `status === "importing"`

## Dependencies

- `@electric-sql/pglite`: Database
- `@electric-sql/pglite-repl`: REPL component
- `goober`: CSS-in-JS
- `react`, `react-dom`: UI framework
- `vite`: Build tool

## Build & Deploy

- Static build: `bun run build`
- Output: `dist/` folder
- Ready for GitHub Pages, Vercel, Netlify, etc.
