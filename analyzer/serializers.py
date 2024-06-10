from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from django.db.models import Q

from .models import Project, Author, Alias, Repository, Commit, Contrib


class ProjectSerializer(serializers.ModelSerializer):
    """General purpose Serializer for Project model."""
    class Meta:
        model = Project
        fields = '__all__'

class AuthorSerializer(serializers.ModelSerializer):
    """General purpose Serializer for Author model."""
    class Meta:
        model = Author
        fields = '__all__'


class AliasSerializer(serializers.ModelSerializer):
    """General purpose Serializer for Alias model."""
    class Meta:
        model = Alias
        fields = '__all__'

class RepositorySerializer(serializers.ModelSerializer):
    """General purpose Serializer for Repository model."""
    class Meta:
        model = Repository
        fields = '__all__'


class RepositoryProjectSerializer(serializers.ModelSerializer):
    """General purpose Serializer for Repository model to include project info."""
    project = ProjectSerializer(read_only=True)
    class Meta:
        model = Repository
        fields = '__all__'


class CommitSerializer(serializers.ModelSerializer):
    """General purpose Serializer for Commit model."""
    class Meta:
        model = Commit
        fields = '__all__'


class CommitAuthorSerializer(serializers.ModelSerializer):
    """General purpose Serializer for Commit model includes author details."""
    author = AuthorSerializer(read_only=True)
    class Meta:
        model = Commit
        fields = '__all__'


class CommitRepositorySerializer(serializers.ModelSerializer):
    """General purpose Serializer for Commit model includes repository details."""
    repository = RepositoryProjectSerializer(read_only=True)
    class Meta:
        model = Commit
        fields = '__all__'


class AuthorDetailSerializer(serializers.ModelSerializer):
    """Serializer for Author model with commits field.
    The commits field is a list of the last 100 commits made by the author in
    the last 7 days."""
    commits = serializers.SerializerMethodField()

    def get_commits(self, obj):
        seven_days_ago = timezone.now() - timedelta(days=7)
        commits = obj.commit_set.filter(timestamp__gte=seven_days_ago).order_by('-timestamp')[0:100]
        return CommitRepositorySerializer(commits, many=True).data

    class Meta:
        model = Author
        fields = ['name', 'slug', 'commits']


class ProjectDetailSerializer(serializers.ModelSerializer):
    """Serializer for Project model with commits field.
    The commits field is a list of the last 100 commits made in the last 7 days 
    by any author in the project."""
    commits = serializers.SerializerMethodField()

    def get_commits(self, obj):
        seven_days_ago = timezone.now() - timedelta(days=7)
        commits = Commit.objects.filter( Q(timestamp__gte=seven_days_ago) & Q(repository__project=obj)
                                         ).order_by('-timestamp')[0:100]
        
        return CommitSerializer(commits, many=True).data
    
    class Meta:
        model = Project
        fields = ['name', 'lines', 'contributors', 'last_fetch', 'commits']


class RepositoryDetailSerializer(serializers.ModelSerializer):
    """Serializer for Repository model with commits field.
    The commits field is a list of the last 100 commits made in the last 7 days
    within the repository."""
    commits = serializers.SerializerMethodField()
    project = ProjectSerializer(read_only=True)

    def get_commits(self, obj):
        seven_days_ago = timezone.now() - timedelta(days=7)
        commits = Commit.objects.filter( Q(timestamp__gte=seven_days_ago) & Q(repository=obj)
                                         ).order_by('-timestamp')[0:100]
        return CommitAuthorSerializer(commits, many=True).data
        
    class Meta:
        model = Repository
        fields = ['name', 'lines', 'contributors', 'last_fetch', 'commits','url','project']


class ContribSerializer(serializers.ModelSerializer):
    """Contrib represents the number of commits made by an author in a repository."""
    class Meta:
        model = Contrib
        fields = '__all__'

class RepositoryCommitSerializer(serializers.ModelSerializer):
    """Serializer for Repository model with total commits during the given period"""
    commits = serializers.IntegerField()
    project = ProjectSerializer(read_only=True)

    class Meta:
        model = Repository
        fields = ['id', 'last_fetch', 'url','lines','contributors','skip',
                  'success','commits','name','project']

    
class AuthorCommitSerializer(serializers.ModelSerializer):
    """Serializer for Author model with total commits during the given period by the author"""
    commits = serializers.IntegerField()
    

    class Meta:
        model = Author
        fields = ['id','name', 'slug', 'commits']      


class ProjectCommitSerializer(serializers.ModelSerializer):
    """Serializer for Project model with total commits during the given period"""
    commits = serializers.IntegerField()

    class Meta:
        model = Project
        fields = ['id', 'name', 'lines', 'commits','last_fetch','contributors']
