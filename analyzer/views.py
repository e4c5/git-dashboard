from rest_framework import viewsets
from .models import Project, Author, Alias, Repository, Commit, Contrib
from .serializers import ProjectSerializer, AuthorSerializer, AliasSerializer, RepositorySerializer, CommitSerializer, ContribSerializer

class ProjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

class AuthorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer

class AliasViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Alias.objects.all()
    serializer_class = AliasSerializer

class RepositoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Repository.objects.all()
    serializer_class = RepositorySerializer

class CommitViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Commit.objects.all()
    serializer_class = CommitSerializer

class ContribViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Contrib.objects.all()
    serializer_class = ContribSerializer