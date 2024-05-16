from django.db import models

# Create your models here.
class Project(models.Model):
    name = models.CharField(max_length=100)

class Author(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)

class Repository(models.Model):
    name = models.CharField(max_length=100, unique=True)
    last_fetch = models.DateTimeField(auto_now_add=True)
    url = models.URLField()
    project = models.ForeignKey(Project, on_delete=models.PROTECT )

class Commit(models.Model):
    hash = models.CharField(max_length=40, unique=True)
    author = models.ForeignKey('Author', on_delete=models.PROTECT)
    timestamp = models.DateTimeField()
    repository = models.ForeignKey(Repository, on_delete=models.PROTECT)
    message = models.TextField()

class Lines(models.Model):
    author = models.ForeignKey('Author', on_delete=models.PROTECT)
    count = models.IntegerField()
    respository = models.ForeignKey(Repository, on_delete=models.PROTECT)
