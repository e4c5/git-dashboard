# Git Dashboard - AI Agent Instructions

## Project Overview
Git Dashboard is a Django + React application that analyzes git repositories to provide contributor statistics, commit activity, and line counts across multiple projects. It uses GitPython to traverse repositories and Django REST Framework for the REST API.

## Architecture

### Backend Stack (Django)
- **Framework**: Django 5.2.9 with Django REST Framework 3.16.1
- **Database**: SQLite (`db.sqlite3`) with six core models
- **Single App**: `analyzer` - contains all git analysis logic, models, API views, and management commands
- **Git Operations**: GitPython 3.1.45 and gitdb 4.0.12
- **ASGI Server**: Daphne 4.2.1 (optional, can use Django's runserver)

### Frontend Stack (React)
- **Framework**: React 19.2.3 with React DOM from `react-dom/client`
- **No TypeScript** (explicit project preference - see README: "Typescript? No thank you")
- **Package Manager**: Bun 1.3+ (faster npm alternative) - use `bun install`, `bun add`, `bun run`
- **Bundler**: Webpack 5.104.1 with Babel for JSX transpilation
- **UI Libraries**: Material-UI 5.18.0 and Semantic UI React 2.1.5
- **Visualization**: Google Charts (loaded via CDN)
- **Routing**: React Router v6.30.2

### Database Models
```
Project (name, lines, contributors, last_fetch, skip)
  ├─ Repository (name, url, lines, contributors, last_fetch, skip, success, message)
  │   ├─ Commit (hash, author, timestamp, message)
  │   └─ Contrib (author, count) [unique: author + repository]
  │
Author (name, slug)
  └─ Alias (author, slug) [for deduplicating author identities]
```

**Key relationships**:
- Projects contain multiple Repositories
- Authors are deduplicated via slugs (lowercased, dots replaced with spaces)
- Aliases link alternate author identities to canonical Authors
- Contrib tracks line counts per author/repository pair

### Critical Data Flow
1. **Analysis**: `python manage.py analyze` scans filesystem for git repos
2. **Processing**: Fetches updates, extracts commits, optionally counts lines via `git blame`
3. **Storage**: Aggregates data into Django models (Projects, Repos, Authors, Commits, Contribs)
4. **API**: DRF viewsets expose endpoints at `/api/` (projects, authors, repositories, commits, contribs)
5. **Frontend**: React fetches from `/api/commits/by_author/`, `/api/commits/by_repository/`, `/api/commits/by_project/`

## Build & Deployment

### Webpack Build System
- **Custom Plugin**: `HtmlUpdater` in `webpack.config.js` modifies `analyzer/templates/analyzer/index.html`
- **Production**: Replaces script src with hashed bundle name (`bundle[contenthash].js`)
- **Development**: Uses plain `bundle.js`
- **Output Location**: `analyzer/static/js/bundle*.js` (Django looks for files in app static dirs)

**Important**: Never manually edit script tags in `analyzer/templates/analyzer/index.html` - webpack overwrites them on build.

### Running the Application

**Backend**:
```bash
python manage.py runserver
# or with Daphne for async support:
daphne -b 0.0.0.0 -p 8000 dashboard.asgi:application
```

**Frontend (Watch Mode - Development)**:
```bash
bun run watch  # auto-rebuilds on file changes
# output: analyzer/static/js/bundle.js
```

**Frontend (Production Build)**:
```bash
bun run build  # creates hashed bundle
# output: analyzer/static/js/bundle[hash].js
```

**Installing Dependencies**:
```bash
bun install  # faster than npm install
# or: npm install, bun add <package>, npm add <package>
```

## Management Commands

### analyze
Primary command for scanning and processing git repositories.

**Basic usage**:
```bash
# Single repository
python manage.py analyze /path/to/repo

# All repos recursively (organized as /base/project-name/repo-name/)
python manage.py analyze /path/to/projects --all

# Skip fetching updates (faster for local testing)
python manage.py analyze /path/to/repo --no-fetch

# Skip line counting (much faster, prevents OOM on large repos)
python manage.py analyze /path/to/projects --all --skip-blame

# Filter commits by timestamp
python manage.py analyze /path/to/repo --timestamp "2024-01-01 00:00:00"
```

**Flags**:
- `--timestamp`: Only process commits newer than the given timestamp (format: `'YYYY-MM-DD HH:MM:SS'`)
- `--all`: Recursively analyze all repos (expects: `/base-path/project-name/repo-name/.git`)
- `--no-fetch`: Skip fetching from remote (faster for local testing)
- `--skip-blame`: Skip line counting via `git blame` (much faster, only processes commit history)
- `--skip-fetch-hours N`: Skip fetching if last fetch was within N hours (default: 24)
- `--skip-analysis-hours N`: Skip analysis if last analyzed within N hours (default: 24, 0 to disable)

**Repository Organization**:
The `--all` flag expects this directory structure:
```
/base-path/
  project-name-1/
    repo-name-1/.git
    repo-name-2/.git
  project-name-2/
    repo-name-3/.git
```
Parent directory names become `Project` names in the database.

**Memory Considerations**:
- Line counting uses `git blame --line-porcelain` on every file in every commit
- Very memory-intensive on large codebases
- For large repos or many repos, use `--skip-blame` to avoid OOM (exit code 137)
- Use `--skip-fetch-hours` and `--skip-analysis-hours` to avoid re-processing unchanged repos

### Other Commands
- `cleanup`: Resets all Project/Repository stats (lines, contributors, timestamps) - use when starting fresh
- `lines`: Counts total lines in a directory, excluding binaries and `.git`

## Project-Specific Patterns

### Author Identity Management
Authors are deduplicated via slugs (lowercased, dots replaced with spaces). The `Author.get_or_create()` classmethod:
1. Slugifies the author name
2. Checks if an Alias exists for that slug
3. Returns the canonical Author linked by the Alias (or creates new if not found)

**Important**: When creating an `Alias`, the signal handler `update_alias` in `models.py` **deletes all Commits and Contribs** under the old author slug. This is **destructive** - warn users or implement safeguards.

### Git Operations
- Uses `repo.iter_commits(all=True, max_count=100000)` - processes last 100k commits across all branches
- `git blame --line-porcelain` for line counting (see `importer.py`)
- Always fetches from `origin` unless `--no-fetch` is used
- Error handling: catches `GitCommandError`, `BadName` → sets `repository.success=False` and stores message

### API Endpoints
All endpoints at `/api/` with DRF browsable API. Custom actions on `CommitViewSet`:

- `/api/commits/by_author/?days=30` - aggregates commit counts per author (default: 30 days)
- `/api/commits/by_repository/?days=7` - aggregates by repository (default: 7 days)
- `/api/commits/by_project/?days=14` - aggregates by project (default: 14 days)

**Detail Parameter**:
Append `?detail=1` to get richer serializers:
- `ProjectDetailSerializer`: includes last 100 commits (7 days)
- `AuthorDetailSerializer`: includes commits with nested repository/project data
- `RepositoryDetailSerializer`: similar nested pattern

### Settings & Configuration
- `dashboard/settings.py` imports `settings_local.py` at the end for local overrides
- Example override in `settings_local.py`:
```python
GITDB_CONFIG = {"url_pattern": "http://bitbucket-server:7990/"}
```
- The `/api/config/` endpoint exposes `GITDB_CONFIG` to frontend for generating repository links

## File Structure Reference

### Key Directories
- `analyzer/` - main Django app (models, views, serializers, management commands)
- `analyzer/management/commands/` - `analyze.py`, `cleanup.py`, `lines.py`
- `analyzer/migrations/` - database migrations
- `analyzer/static/js/` - webpack output bundles
- `analyzer/templates/analyzer/` - `index.html` (managed by webpack)
- `jsx/` - React source files (JSX)
- `dashboard/` - Django project settings

### Key Files
- `models.py` - Project, Author, Alias, Repository, Commit, Contrib models + signal handlers
- `importer.py` - GitPython integration, commit extraction, line counting
- `analyze.py` - main management command for repo analysis
- `views.py` - DRF viewsets for all models
- `serializers.py` - DRF serializers (basic and detail versions)
- `webpack.config.js` - webpack config with custom HtmlUpdater plugin
- `jsx/main.jsx` - React entry point
- `jsx/charts.jsx` - main Chart component using Google Charts
- `jsx/author.jsx`, `jsx/project.jsx`, `jsx/repo.jsx` - individual components

## Common Pitfalls

1. **Skipping repos**: Check `project.skip` and `repository.skip` flags in database if analysis seems incomplete
2. **Missing remotes**: If a repo has no remotes, the code uses the local filesystem path as the URL
3. **Timestamp format**: Must be exactly `'YYYY-MM-DD HH:MM:SS'` or parsing fails
4. **Line count discrepancies**: `git blame` only counts files in the current branch (usually `master`)
5. **Script tag corruption**: Never manually edit script src in `analyzer/templates/analyzer/index.html` - webpack rewrites it
6. **Alias signal deletion**: Creating an Alias deletes related Commits/Contribs - implement confirmation dialogs
7. **OOM issues**: Large repos cause memory exhaustion during `git blame` - use `--skip-blame` flag
8. **Bundle path**: Webpack always outputs to `analyzer/static/js/` - Django's static file finder looks there

## Testing
Frontend tests use Jest with React Testing Library:
```bash
bun run test  # or: bun test
bun run test --coverage
```

No backend tests currently exist - consider adding for author deduplication and critical import paths.

## Development Workflow

1. **Start backend**: `python manage.py runserver` (or `daphne`)
2. **Start frontend**: `bun run watch` (in separate terminal)
3. **Run analysis**: `python manage.py analyze /path/to/repos --all`
4. **Build for production**: `bun run build`
5. **Access UI**: http://localhost:8000

## External Dependencies Summary
- **GitPython 3.1.45** - git repo operations (commits, blame, fetch)
- **Django 5.2.9** - web framework and ORM
- **Django REST Framework 3.16.1** - API endpoints and serialization
- **React 19.2.3** - UI framework (uses `createRoot` from `react-dom/client`)
- **Webpack 5.104.1** - module bundler
- **Babel** - JSX transpilation
- **Bun 1.3+** - fast package manager and test runner
- **Google Charts** - charting library (CDN)
- **Material-UI 5.18 + Semantic UI React 2.1** - component libraries

## Debugging Tips
- Check `repository.message` field for detailed git operation errors
- Print statements in `analyze.py` show which repos are being processed
- Use DRF browsable API at `/api/` for manual endpoint testing
- Console logs in JSX files include version numbers (e.g., "charts.js 0.02")
- Use `repository.success` flag to identify repos that failed during analysis
- Check `--timestamp` format: must be `'YYYY-MM-DD HH:MM:SS'` exactly
