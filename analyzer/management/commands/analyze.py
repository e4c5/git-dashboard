"""
A Django management command to analyze git repositories at the given location.
Repositories can be organized together into projects and by using the -all flag
it is possible to analyze all repositories recursively.

In case some projects or repositories do not need analysis their skip flag can
be set to True.
"""
import os
from datetime import datetime
from git import Repo

from django.core.management.base import BaseCommand     
from django.utils.text import slugify
from django.db import transaction

from analyzer.importer import open_repo, get_commits, count_lines_by_author,get_last_modified_time
from analyzer.models import Author, Repository, Commit, Contrib, Project

class Command(BaseCommand):
    
    def add_arguments(self, parser):
        parser.add_argument('location', type=str)
        parser.add_argument('--timestamp', type=str, required=False)
        parser.add_argument('--all', action='store_true', help='An optional all argument')
    
    def handle(self, *args, **options):
        repo_path = options['location']
        timestamp = options['timestamp']
        all = options['all']
        if all:
            for project in os.listdir(repo_path):
                if os.path.isdir(os.path.join(repo_path, project)) and not project.startswith('.'):
                    if os.path.isdir(os.path.join(repo_path, project, '.git')):
                        self.import_repo(repo_path, timestamp)
                    else:   
                        self.recurse(os.path.join(repo_path, project), timestamp)
        else:
            self.import_repo(repo_path, timestamp)

    def recurse(self, repo_path, timestamp):
        print("Recurse", repo_path)
        for repo in os.listdir(repo_path):
            self.import_repo(os.path.join(repo_path, repo), timestamp)


    
    def import_repo(self, repo_path, timestamp):
        print(repo_path)
        repo = open_repo(repo_path)
        if repo is None:
            print('Repository not found')
            return

        project = self.get_project(repo_path)
        if project.skip:
            return
        
        repo_name = os.path.basename(os.path.normpath(repo_path))

        repository, _ = Repository.objects.get_or_create(
            name=repo_path.split('/')[-1],
            defaults = {'name': repo_name, 'url': repo_path, 'project': project},
        )
        if repository.skip:
            return
        
        try:
            if timestamp is None:
                timestamp = repository.last_fetch
            else:                        
                timestamp = datetime.strptime(timestamp, '%Y-%m-%d %H:%M:%S')

            if timestamp:
                if timestamp >= get_last_modified_time(repo_path):
                    print('No new commits')
                    return
                else:
                    print(timestamp, get_last_modified_time(repo_path))

            timestamp = self.log_commits(timestamp, repo, repository)
            total = self.line_counts(repo, repository)

            project.lines += total
            project.contributors = Contrib.objects.filter(repository__project=project).count()
            if project.last_fetch is None or project.last_fetch < timestamp:
                project.last_fetch = timestamp
            project.save()

            repository.lines = total
            repository.contributors = Contrib.objects.filter(repository=repository).count()
            repository.last_fetch = timestamp
            repository.save()
        except Exception as e:
            print(e)
            repository.success = False
            repository.save()

        return

    
    @transaction.atomic
    def log_commits(self, timestamp, repo, repository):
        for commit in get_commits(repo, timestamp):
            author = Author.get_or_create(commit.author.name)
            if timestamp is None or commit.committed_datetime > timestamp:
                timestamp = commit.committed_datetime

            commit, _ = Commit.objects.get_or_create(
                hash=commit.hexsha,
                defaults = {'hash': commit.hexsha, 'author': author, 'timestamp': 
                            commit.committed_datetime, 'repository': repository, 'message': commit.message}
            )
            
        return timestamp

    @transaction.atomic
    def line_counts(self, repo, repository):
        lines_by_author = count_lines_by_author(repo)
        total = 0

        for commiter, count in lines_by_author.items():
            author = Author.get_or_create(commiter)
            Contrib.objects.get_or_create(
                author=author,repository = repository,
                defaults = {'author': author, 'count': count, 'repository': repository}
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