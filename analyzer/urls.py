from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import ProjectViewSet, AuthorViewSet, AliasViewSet, RepositoryViewSet, CommitViewSet, ContribViewSet
from .views import gitdb_config

router = DefaultRouter()
router.register(r'projects', ProjectViewSet)
router.register(r'authors', AuthorViewSet)
router.register(r'aliases', AliasViewSet)
router.register(r'repositories', RepositoryViewSet)
router.register(r'commits', CommitViewSet)
router.register(r'contribs', ContribViewSet)

urlpatterns = [
    path('config/', gitdb_config, name='gitdb-config'),
] + router.urls