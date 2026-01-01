# Git Dashboard - AI Agent Instructions

## Project Overview
Git Dashboard is a Django + React application that analyzes git repositories to show contributor statistics, commit activity, and line counts across multiple projects. It uses GitPython to traverse repositories and DRF for the REST API.

## Architecture

### Backend (Django)
- **Single app**: `analyzer` - handles all git analysis, models, and API endpoints
- **Database**: SQLite with models: `Project`, `Repository`, `Author`, `Commit`, `Contrib`, `Alias`
- **Key hierarchy**: Projects contain Repositories; Authors make Commits; Contrib tracks line counts per author/repo
- **Author deduplication**: `Author.get_or_create()` uses slugified names; `Alias` model links alternate author identities

### Frontend (React + JSX)
- **No TypeScript** (explicit project preference - see README)
- **Package manager**: Bun (fast npm replacement) - use `bun install`, `bun add`, `bun run`
- **React 19**: Uses `createRoot` from `react-dom/client` (not legacy `react-dom`)
- **Build system**: Webpack with custom `HtmlUpdater` plugin that auto-updates script tags in `analyzer/templates/analyzer/index.html`
- **Entry point**: `jsx/main.jsx` → outputs to `analyzer/static/js/bundle[hash].js`
- **Google Charts**: Loaded via CDN for visualizations (Charts, Table components)

### Data Flow
1. Management command `analyze` scans filesystem for git repos → fetches updates → extracts commits/blame data
2. Django models store aggregated stats (lines, contributors, timestamps)
3. DRF viewsets expose API at `/api/` (projects, authors, repositories, commits, contribs)
4. React frontend fetches from `/api/commits/by_author/`, `/api/commits/by_repository/`, `/api/commits/by_project/`

## Critical Workflows

### Running the Application
```bash
# Backend
python manage.py runserver  # or use daphne

# Frontend (development)
bun run watch  # auto-rebuilds on changes

# Frontend (production)
bun run build  # creates hashed bundle

# Install dependencies
bun install  # faster than npm install
```

### Analyzing Repositories
```bash
# Single repo
python manage.py analyze /path/to/repo

# All repos recursively (organized in project folders)
python manage.py analyze /path/to/projects --all

# Skip fetching updates (faster)
python manage.py analyze /path/to/repo --no-fetch

# Filter by timestamp
python manage.py analyze /path/to/repo --timestamp "2024-01-01 00:00:00"
```

**Important**: The `analyze` command expects repos organized as `/base-path/project-name/repo-name/.git`. The parent directory name becomes the `Project` name.

### Other Management Commands
- `cleanup` - resets all Project/Repository stats (lines, contributors, timestamps)
- `lines` - counts total lines in a directory, excluding binaries and `.git`

## Project-Specific Patterns

### Author Identity Management
Authors are deduplicated via slugs (lowercased, dot-replaced). When an `Alias` is created pointing to a canonical `Author`, the signal handler (`update_alias` in `models.py`) **deletes** all Commits/Contribs under the old author slug. This is a destructive operation - warn users before creating aliases.

### Git Operations
- Uses GitPython's `repo.iter_commits(all=True, max_count=100000)` - processes last 100k commits across all branches
- `git blame --line-porcelain` extracts line counts per author (see `importer.py`)
- Always fetches from `origin` unless `--no-fetch` flag used
- Error handling: catches `GitCommandError`, `BadName` → sets `repository.success=False`

### API Query Patterns
ViewSets support `?detail=1` param to use richer serializers:
- `ProjectDetailSerializer` includes last 100 commits (7 days)
- `AuthorDetailSerializer` includes commits with nested repository/project data
- `RepositoryDetailSerializer` similar nested pattern

Custom actions on `CommitViewSet`:
- `/api/commits/by_author/?days=30` - aggregates commit counts per author
- `/api/commits/by_repository/?days=7` - aggregates by repo (default 7 days)
- `/api/commits/by_project/?days=14` - aggregates by project

### Webpack Build System
The custom `HtmlUpdater` plugin (in `webpack.config.js`) modifies `analyzer/templates/analyzer/index.html` directly:
- **Production**: replaces script src with hashed bundle name (`bundle[contenthash].js`)
- **Development**: uses `bundle.js`

**Never** manually edit the script tag in `index.html` - it gets overwritten on build.

### Settings Override
`dashboard/settings.py` imports `settings_local.py` at the end for local overrides. Example:
```python
GITDB_CONFIG = {"url_pattern": "http://bitbucket-server:7990/"}
```
The `/api/config/` endpoint exposes this to the frontend for generating repository links.

## Common Pitfalls

1. **Skipping repos**: Check `project.skip` and `repository.skip` flags in DB if analysis seems incomplete
2. **Missing remotes**: If repo has no remotes, uses local path as URL
3. **Timestamp filtering**: Provide in `'YYYY-MM-DD HH:MM:SS'` format exactly
4. **Line count discrepancies**: `git blame` only counts files in the current branch (default `master`)
5. **Webpack bundle path**: Always outputs to `analyzer/static/js/` (Django looks in app static dirs)

## Testing
Frontend tests use Jest with React Testing Library (see `package.json`):
```bash
bun run test  # or bun test
```

No backend tests currently exist (consider adding for critical paths like author deduplication).

## External Dependencies
- **GitPython 3.1.45** - core git operations (commits, blame, fetch)
- **Django 5.2.9** - web framework
- **Django REST Framework 3.16.1** - all API endpoints
- **React 19.2.3** - UI framework (uses new `createRoot` API from `react-dom/client`)
- **Webpack 5.104.1** - bundler
- **Bun 1.3+** - package manager and test runner
- **Google Charts** - frontend visualization (loaded via CDN)
- **Material-UI 5.18 + Semantic UI React 2.1** - component libraries (both in use)

## Debugging Tips
- Check `repository.message` field for git operation errors
- Print statements in `analyze.py` show repo paths being processed
- DRF browsable API at `/api/` for testing endpoints manually
- Console logs in JSX files include version numbers (e.g., "charts.js 0.01")
