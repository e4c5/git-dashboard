from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, AuthorViewSet, AliasViewSet, RepositoryViewSet, CommitViewSet, ContribViewSet

router = DefaultRouter()
router.register(r'projects', ProjectViewSet)
router.register(r'authors', AuthorViewSet)
router.register(r'aliases', AliasViewSet)
router.register(r'repositories', RepositoryViewSet)
router.register(r'commits', CommitViewSet)
router.register(r'contribs', ContribViewSet)

urlpatterns = router.urls