from rest_framework import serializers
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

class ContribSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contrib
        fields = '__all__'

class AuthorCommitSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)

    class Meta:
        model = Commit
        fields = ['author', 'total']

    total = serializers.IntegerField()        