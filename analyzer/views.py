from datetime import timedelta

from django.db.models import Count, F
from django.utils import timezone
from django.shortcuts import render
from rest_framework import viewsets, pagination, decorators, response

from .models import Project, Author, Alias, Repository, Commit, Contrib
from .serializers import ProjectSerializer, AuthorSerializer, AuthorDetailSerializer
from .serializers import AliasSerializer, RepositoryCommitSerializer
from .serializers import RepositorySerializer, CommitSerializer, ContribSerializer, AuthorCommitSerializer
from .serializers import ProjectCommitSerializer, ProjectDetailSerializer


class CustomCursorPagination(pagination.CursorPagination):
    page_size = 100
    ordering = 'pk'


class ProjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

    def get_serializer_class(self):
        if self.request.query_params.get('detail'):
            return ProjectDetailSerializer
        return ProjectSerializer
        

class AuthorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Author.objects.all()

    def get_serializer_class(self):
        if self.request.query_params.get('detail'):
            return AuthorDetailSerializer
        return AuthorSerializer

class AliasViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Alias.objects.all()
    serializer_class = AliasSerializer


class RepositoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Repository.objects.all()
    serializer_class = RepositorySerializer


class CommitViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Commit.objects.all()
    serializer_class = CommitSerializer
    pagination_class = CustomCursorPagination

    @decorators.action(detail=False, methods=['get'])
    def by_author(self, request, *args, **kwargs):
        """Counts total commits by author.
        Filtered by the number of days and defaults to 7 if not provided"""
        days = request.query_params.get('days', 7)
        since = timezone.now() - timedelta(days=int(days))
        authors = Author.objects.filter(commit__timestamp__gte=since)\
                                .annotate(total=Count('commit'))\
                                .order_by('-total')
        serializer = AuthorCommitSerializer(authors, many=True)

        print(authors.query)
        return response.Response(serializer.data)
    

    @decorators.action(detail=False, methods=['get'])
    def by_repository(self, request, *args, **kwargs):
        """Counts total commits by repository.
        Filtered by the number of days and defaults to 7 if not provided"""
        days = request.query_params.get('days', 7)
        since = timezone.now() - timedelta(days=int(days))
        repositories = Repository.objects.filter(commit__timestamp__gte=since)\
                                        .annotate(total=Count('commit'))\
                                        .order_by('-total')
        serializer = RepositoryCommitSerializer(repositories, many=True)
        return response.Response(serializer.data)

    @decorators.action(detail=False, methods=['get'])
    def by_project(self, request, *args, **kwargs):
        days = request.query_params.get('days', 7)
        since = timezone.now() - timedelta(days=int(days))
        projects = Project.objects.filter(repository__commit__timestamp__gte=since)\
                                  .annotate(total=Count('repository__commit'))\
                                  .order_by('-total')
        serializer = ProjectCommitSerializer(projects, many=True)
        return response.Response(serializer.data)


class ContribViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Contrib.objects.all()
    serializer_class = ContribSerializer
    pagination_class = CustomCursorPagination


def home(request):
    print('bada')
    return render(request, 'analyzer/index.html')