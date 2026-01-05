A dashboard for git statistics

We will show the most active contributors across all your projects as well as the
activity in all your projects and repositories in a single location.

To install:
1. Create a python venv and activate it
2. Install the requirements with `pip install -r requirements.txt`
3. Install Bun (or use Node.js)
4. Run `bun install` (or `npm install`)
5. Compile the JavaScript with `bun run build`. During active development use `bun run watch` instead
6. Run the analyze management command to scan your git repositories:
   ```bash
   # Analyze a single repository
   python manage.py analyze /path/to/repo
   
   # Analyze all repositories under a directory (expects: /base/project-name/repo-name/)
   python manage.py analyze /path/to/projects --all
   
   # Skip fetching updates from remote (faster for local testing)
   python manage.py analyze /path/to/repo --no-fetch
   
   # Skip line counting to save memory (only processes commit history)
   python manage.py analyze /path/to/projects --all --skip-blame
   
   # Filter commits by timestamp
   python manage.py analyze /path/to/repo --timestamp "2024-01-01 00:00:00"
   ```
   **Note**: When using `--all`, the command expects repos organized as `/base-path/project-name/repo-name/.git`. 
   The parent directory name becomes the Project name in the database.
   
   **Memory tip**: For large repositories or many repos, use `--skip-blame` to avoid running out of memory.
   Line counting uses `git blame` which is memory-intensive on large codebases.
7. Start the Django development server with `python manage.py runserver` (or use daphne)
8. Open your browser to http://localhost:8000


Typescript? No thank you
