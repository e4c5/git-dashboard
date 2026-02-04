# Git Dashboard

A web dashboard for analyzing git repository statistics. Shows the most active contributors across all your projects, commit activity, and line count metrics in a single location.

## Quick Start

### Prerequisites
- Python 3.8+
- Bun (or Node.js/npm)

### Installation

1. **Setup Python environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # or: venv\Scripts\activate on Windows
   pip install -r requirements.txt
   ```

2. **Setup Node/Bun**:
   ```bash
   bun install
   # or: npm install
   ```

3. **Compile Frontend**:
   ```bash
   # Development (watch for changes):
   bun run watch
   
   # Production:
   bun run build
   ```

4. **Analyze Repositories**:
   ```bash
   # Single repository
   python manage.py analyze /path/to/repo
   
   # All repos recursively (expects: /base/project-name/repo-name/.git)
   python manage.py analyze /path/to/projects --all
   
   # Skip fetching (faster for local testing)
   python manage.py analyze /path/to/repo --no-fetch
   
   # Skip line counting (much faster, saves memory)
   python manage.py analyze /path/to/projects --all --skip-blame
   
   # Filter by timestamp
   python manage.py analyze /path/to/repo --timestamp "2024-01-01 00:00:00"
   ```

5. **Run Server**:
   ```bash
   python manage.py runserver
   # or with async support:
   daphne -b 0.0.0.0 -p 8000 dashboard.asgi:application
   ```

6. **Open Browser**:
   Navigate to http://localhost:8000

## Repository Structure

The `analyze` command expects repositories organized as:
```
/base-path/
  project-name-1/
    repo-name-1/.git
    repo-name-2/.git
  project-name-2/
    repo-name-3/.git
```
Parent directory names become Project names in the database.

## Important Notes

### Memory Usage
- Line counting uses `git blame` which is memory-intensive on large codebases
- For large repos or analyzing many repos, use `--skip-blame` to avoid running out of memory
- Exit code 137 typically indicates OOM (Out of Memory) - try with `--skip-blame`

### Timestamp Format
When using `--timestamp`, use the exact format: `'YYYY-MM-DD HH:MM:SS'`

### Performance Tips
Use `--skip-fetch-hours` and `--skip-analysis-hours` flags to avoid re-processing unchanged repositories, saving time on large monorepos.

## Technology Stack

**Backend**:
- Django 5.2.9
- Django REST Framework 3.16.1
- GitPython 3.1.45
- Daphne 4.2.1 (async ASGI server)

**Frontend**:
- React 19.2.3
- Webpack 5.104.1
- Material-UI 5.18.0 & Semantic UI React 2.1.5
- Bun 1.3+ (package manager)
- Google Charts (CDN)

**Database**: SQLite

## Design Philosophy

> "Typescript? No thank you"

This project intentionally uses plain JavaScript/JSX without TypeScript. The codebase prioritizes simplicity and rapid development over strict type checking.

## For AI Agents

See [.github/agents-instructions.md](./.github/agents-instructions.md) for comprehensive development guidelines including architecture details, common patterns, and troubleshooting.
