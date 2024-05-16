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
from analyzer.models import Author, Repository, Commit, Lines, Project




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

        commits = get_commits(repo, timestamp)

        parent_folder_name = os.path.basename(os.path.dirname(repo_path))
        project, _ = Project.objects.get_or_create(name=parent_folder_name)

        repository, _ = Repository.objects.get_or_create(
            name=repo_path.split('/')[-1],
            defaults = {'name': repo_path.split('/')[-1], 'url': repo_path, 'project': project},
        )
            
        for commit in commits:
            author, _ = Author.objects.get_or_create(slug=slugify(commit['author']),
                                                     defaults = {'name': commit['author'], 'slug': slugify(commit['author'])})
            
            commit, _ = Commit.objects.get_or_create(
                hash=commit['commit_hash'],
                author=author,
                timestamp=commit['commit_timestamp'],
                repository=repository,
                message=commit['message']
            )

        lines_by_author = count_lines_by_author(repo)
        for author, count in lines_by_author.items():
            author, _ = Author.objects.get_or_create(slug=slugify(commit['author']),
                                                     defaults = {'name': commit['author'], 'slug': slugify(commit['author'])})
            Lines.objects.get_or_create(
                author=author,repo = repository,
                defaults = {'author': author, 'count': count, 'repository': repository}
            )


        return