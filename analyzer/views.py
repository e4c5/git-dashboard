from datetime import timedelta

from django.db.models import Count
from django.utils import timezone
from django.shortcuts import render
from rest_framework import viewsets, pagination, decorators, response

from .models import Project, Author, Alias, Repository, Commit, Contrib
from .serializers import ProjectSerializer, AuthorSerializer, AliasSerializer
from .serializers import RepositorySerializer, CommitSerializer, ContribSerializer, AuthorCommitSerializer

class CustomCursorPagination(pagination.CursorPagination):
    page_size = 100
    ordering = 'pk'


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
    pagination_class = CustomCursorPagination

    @decorators.action(detail=False, methods=['get'])
    def author_commits(self, request, *args, **kwargs):
        days = request.query_params.get('days', 7)
        since = timezone.now() - timedelta(days=int(days))
        data = Commit.objects.filter(timestamp__gte=since).values('author').annotate(total=Count('id')).order_by('-total')
        authors = {author.id: author for author in Author.objects.filter(id__in=[item['author'] for item in data])}
        for item in data:
            item['author'] = authors[item['author']]
        serializer = AuthorCommitSerializer(data, many=True)
        return response.Response(serializer.data)
    

class ContribViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Contrib.objects.all()
    serializer_class = ContribSerializer
    pagination_class = CustomCursorPagination


def home(request):
    print('bada')
    return render(request, 'analyzer/index.html')