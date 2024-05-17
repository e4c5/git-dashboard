#
# A django management command that will take a repository location as an argument and analyze the repository.
# the results will be saved using the models defined in models.py
#
import os
from datetime import datetime
from git import Repo

from django.core.management.base import BaseCommand     
from django.utils.text import slugify
from analyzer.importer import open_repo, get_commits, count_lines_by_author
from analyzer.models import Author, Repository, Commit, Contrib, Project




class Command(BaseCommand):
    
    def add_arguments(self, parser):
        parser.add_argument('repo_path', type=str)
        parser.add_argument('--timestamp', type=str, required=False)

    def handle(self, *args, **options):
        repo_path = options['repo_path']
        timestamp = options['timestamp']
        repo = open_repo(repo_path)
        if repo is None:
            print('Repository not found')
            return

        project = self.get_project(repo_path)
        repo_name = os.path.basename(os.path.normpath(repo_path))

        repository, _ = Repository.objects.get_or_create(
            name=repo_path.split('/')[-1],
            defaults = {'name': repo_name, 'url': repo_path, 'project': project},
        )
            
        for commit in get_commits(repo, timestamp):
            author = Author.get_or_create(commit.author.name)
            
            commit, _ = Commit.objects.get_or_create(
                hash=commit.hexsha,
                author=author,
                timestamp=commit.committed_datetime,
                repository=repository,
                message=commit.message
            )

        lines_by_author = count_lines_by_author(repo)
        for commiter, count in lines_by_author.items():
            author = Author.get_or_create(commiter)
            
            Contrib.objects.get_or_create(
                author=author,repository = repository,
                defaults = {'author': author, 'count': count, 'repository': repository}
            )


        return

    def get_project(self, repo_path):
        path = os.path.normpath(repo_path)
        components = path.split(os.sep)
        

        if len(components) > 1:
            name =  components[-2]
        else:
            return None
        
        project, _ = Project.objects.get_or_create(name=name)
        return project