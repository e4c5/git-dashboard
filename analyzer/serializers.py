from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from django.db.models import Q

from .models import Project, Author, Alias, Repository, Commit, Contrib


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'

class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = '__all__'


class AliasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alias
        fields = '__all__'

class RepositorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Repository
        fields = '__all__'

class CommitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Commit
        fields = '__all__'


class AuthorDetailSerializer(serializers.ModelSerializer):
    commits = serializers.SerializerMethodField()

    def get_commits(self, obj):
        seven_days_ago = timezone.now() - timedelta(days=7)
        commits = obj.commit_set.filter(timestamp__gte=seven_days_ago)
        return CommitSerializer(commits, many=True).data

    class Meta:
        model = Author
        fields = ['name', 'slug', 'commits']

class ProjectDetailSerializer(serializers.ModelSerializer):
    commits = serializers.SerializerMethodField()

    def get_commits(self, obj):
        seven_days_ago = timezone.now() - timedelta(days=7)
        commits = Commit.objects.filter( Q(timestamp__gte=seven_days_ago) & Q(repository__project=obj)
                                         ).order_by('-timestamp')[0:100]
        
        return CommitSerializer(commits, many=True).data
    
    class Meta:
        model = Project
        fields = ['name', 'lines', 'contributors', 'last_fetch', 'commits']



class ContribSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contrib
        fields = '__all__'

class RepositoryCommitSerializer(serializers.ModelSerializer):
    total = serializers.IntegerField()

    class Meta:
        model = Repository
        fields = ['last_fetch', 'url','lines','contributors','skip',
                  'success','total','name']

    
class AuthorCommitSerializer(serializers.ModelSerializer):
    total = serializers.IntegerField()

    class Meta:
        model = Author
        fields = ['id','name', 'slug', 'total']      


class ProjectCommitSerializer(serializers.ModelSerializer):
    total = serializers.IntegerField()

    class Meta:
        model = Project
        fields = ['name', 'lines', 'total','last_fetch','contributors']
