"""
A Django management command to analyze git repositories at the given location.
Repositories can be organized together into projects and by using the -all flag
it is possible to analyze all repositories recursively.

In case some projects or repositories do not need analysis their skip flag can
be set to True.
"""
import gc
import os
from datetime import datetime, timedelta
from git import GitCommandError, Repo
from gitdb.exc import BadName

from django.core.management.base import BaseCommand     
from django.utils.text import slugify
from django.db import transaction, models
from django.utils import timezone

from analyzer.importer import count_lines_by_author,get_last_modified_time
from analyzer.models import Author, Repository, Commit, Contrib, Project

class Command(BaseCommand):
    
    def add_arguments(self, parser):
        parser.add_argument('location', type=str)
        parser.add_argument('--timestamp', type=str, required=False, help='Only check for commits that are newer than the given timestamp')
        parser.add_argument('--all', action='store_true', help='Process all projects and repositories recursively')
        parser.add_argument('--no-fetch', action='store_true', help='Dont fetch the repository before analyzing it')
        parser.add_argument('--skip-blame', action='store_true', help='Skip line counting (much faster, only processes commits)')
        parser.add_argument('--skip-fetch-hours', type=int, default=24, help='Skip fetching if last fetch was within N hours (default: 24)')
        parser.add_argument('--skip-analysis-hours', type=int, default=24, help='Skip analysis if last analyzed within N hours (default: 24, 0 to disable)')
    
    def handle(self, *args, **options):
        repo_path = options['location']
        timestamp = options['timestamp']
        skip_fetch_hours = options['skip_fetch_hours']
        skip_analysis_hours = options['skip_analysis_hours']
        
        if options['all']:
            for project in os.listdir(repo_path):
                if os.path.isdir(os.path.join(repo_path, project)) and not project.startswith('.'):
                    if os.path.isdir(os.path.join(repo_path, project, '.git')):
                        self.import_repo(repo_path, timestamp, options['no_fetch'], options['skip_blame'], skip_fetch_hours, skip_analysis_hours)
                    else:   
                        self.recurse(os.path.join(repo_path, project), timestamp, options['no_fetch'], options['skip_blame'], skip_fetch_hours, skip_analysis_hours)
        else:
            self.import_repo(repo_path, timestamp, options['no_fetch'], options['skip_blame'], skip_fetch_hours, skip_analysis_hours)


    def recurse(self, repo_path, timestamp, no_fetch=False, skip_blame=False, skip_fetch_hours=24, skip_analysis_hours=24):
        for repo in os.listdir(repo_path):
            self.import_repo(os.path.join(repo_path, repo), timestamp, no_fetch, skip_blame, skip_fetch_hours, skip_analysis_hours)


    
    def import_repo(self, repo_path, timestamp, no_fetch=False, skip_blame=False, skip_fetch_hours=24, skip_analysis_hours=24):
        if 'depricated' in repo_path:
            return
        
        print(f"Analyzing: {repo_path}")
        
        if not os.path.exists(repo_path):
            print(f'  ⚠ Repository not found: {repo_path}')
            return
            
        try:
            repo = Repo(repo_path)
        except Exception as e:
            print(f'  ✗ Not a valid git repository: {e}')
            return

        project = self.get_project(repo_path)
        if project.skip:
            return
        
        repo_name = os.path.basename(os.path.normpath(repo_path))
        if repo.remotes:
            url = repo.remotes.origin.url
        else:
            url = repo_path

        repository, created = Repository.objects.update_or_create(
            name=repo_path.split('/')[-1],
            defaults={'name': repo_name, 'url': url, 'project': project},
        )
        if repository.skip:
            return
            
        # Skip reprocessing if analyzed within configured hours (0 to disable)
        if skip_analysis_hours > 0 and repository.last_fetch and not created:
            time_since_analysis = timezone.now() - repository.last_fetch
            if time_since_analysis < timedelta(hours=skip_analysis_hours):
                hours_ago = int(time_since_analysis.total_seconds() // 3600)
                mins_ago = int((time_since_analysis.total_seconds() % 3600) // 60)
                print(f'  ⏭ Skipping (analyzed {hours_ago}h {mins_ago}m ago)')
                return
        
        try:
            if not no_fetch:
                should_fetch = True
                
                # Skip fetch if the last commit in the repo is recent enough
                if skip_fetch_hours > 0:
                    try:
                        last_commit_time = get_last_modified_time(repo_path)
                        if last_commit_time:
                            time_since_commit = timezone.now() - last_commit_time
                            if time_since_commit < timedelta(hours=skip_fetch_hours):
                                hours_ago = int(time_since_commit.total_seconds() // 3600)
                                print(f'    Skipping fetch (last commit {hours_ago}h ago)')
                                should_fetch = False
                    except:
                        pass  # If we can't determine last commit time, fetch anyway
                
                if should_fetch:
                    print(f'    Fetching updates...')
                    repo.remotes.origin.fetch()
            

            if timestamp is None:
                timestamp = repository.last_fetch
            else:                        
                timestamp = datetime.strptime(timestamp, '%Y-%m-%d %H:%M:%S')

            self.log_commits(timestamp, repo, repository)
            
            if skip_blame:
                total = 0
                print('    Skipping line count (--skip-blame)')
            else:
                # Estimate file count to warn about memory usage
                try:
                    branch = repo.active_branch.name if not repo.head.is_detached else 'HEAD'
                    file_count = sum(1 for item in repo.tree(branch).traverse() if item.type == 'blob')
                    if file_count > 5000:
                        print(f'    ⚠ Warning: {file_count} files detected. This may cause OOM. Consider using --skip-blame')
                except:
                    pass
                    
                total = self.line_counts(repo, repository)
                
            timestamp = get_last_modified_time(repo_path)

            # Recalculate project stats from database (don't accumulate)
            project.lines = Contrib.objects.filter(repository__project=project).aggregate(total=models.Sum('count'))['total'] or 0
            project.contributors = Contrib.objects.filter(repository__project=project).values('author').distinct().count()
            if project.last_fetch is None or project.last_fetch < timestamp:
                project.last_fetch = timestamp
            project.save()

            repository.lines = total
            repository.contributors = Contrib.objects.filter(repository=repository).values('author').distinct().count()
            repository.last_fetch = timezone.now()  # Set to current time, not last commit time
            repository.success = True
            repository.save()
            print(f'  ✓ Success: {total} lines, {repository.contributors} contributors')
            
            # Force garbage collection after each repo to prevent memory buildup
            del repo
            gc.collect()
            
        except (GitCommandError, BadName, ValueError) as ge:
            print(f"  ✗ Error analyzing repository {repo_path}: {ge}")
            repository.success = False
            repository.message = str(ge)[:500]  # Store first 500 chars of error
            repository.save()
        except Exception as e:
            print(e)
            import traceback
            traceback.print_exc()
            raise e

    
    def log_commits(self, timestamp, repo, repository):
        """Log commits to the database.
        The last 100,000 commits across all branches are processed in batches.
        Args: timestamp: datetime of the last commit previously seen
                repo: git.Repo object
                repository: Repository object (database model)
        Returns: datetime of the last commit processed
        """
        batch_size = 1000
        commit_count = 0
        
        for commit in repo.iter_commits(all=True, max_count=100000):
            if timestamp is None or commit.committed_datetime > timestamp:
                author = Author.get_or_create(commit.author.name)

                with transaction.atomic():
                    commit, _ = Commit.objects.get_or_create(
                        hash=commit.hexsha,
                        defaults = {'hash': commit.hexsha, 'author': author, 
                                    'timestamp': commit.committed_datetime, 
                                    'repository': repository, 'message': commit.message}
                    )
                
                commit_count += 1
                if commit_count % batch_size == 0:
                    print(f'    Processed {commit_count} commits...')
            else:
                break
            


    def line_counts(self, repo, repository):
        """Count lines of code by author in the given repository
        
        Args: repo: git.Repo object
              repository: Repository object (database model)
        Returns: total number of lines in the git repository"""

        lines_by_author = count_lines_by_author(repo)
        total = 0

        for commiter, count in lines_by_author.items():
            author = Author.get_or_create(commiter)
            Contrib.objects.update_or_create(
                author=author, 
                repository=repository,
                defaults={'count': count}
            )
            total += count
        
        return total

    def get_project(self, repo_path):
        path = os.path.normpath(repo_path)
        components = path.split(os.sep)
        

        if len(components) > 1:
            name =  components[-2]
        else:
            return None
        
        project, _ = Project.objects.get_or_create(name=name)
        return project