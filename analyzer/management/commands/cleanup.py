
from typing import Any
from django.core.management.base import BaseCommand
from analyzer.models import Project, Repository, Commit, Author, Contrib, Alias

class Command(BaseCommand):

    def handle(self, *args: Any, **options: Any):
        Project.objects.all().update(lines=0, contributors=0, last_fetch=None)
        Repository.objects.all().update(lines=0, contributors=0, last_fetch=None, success=True)
        #Commit.objects.all().delete()
        #Contrib.objects.all().delete()
        # Alias.objects.all().delete()
        # Author.objects.all().delete()
        