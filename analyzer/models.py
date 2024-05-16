from django.db import models

# Create your models here.
class Project(models.Model):
    name = models.CharField(max_length=100)

class Author(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)

class Alias(models.Model):
    author = models.ForeignKey('Author', on_delete=models.PROTECT)
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

class Contrib(models.Model):
    author = models.ForeignKey('Author', on_delete=models.PROTECT)
    count = models.IntegerField()
    repository = models.ForeignKey(Repository, on_delete=models.PROTECT)

    class Meta:
        unique_together = ('author', 'repository')
        

# signal handler for Alias post save that will update the Repository, Commit and Contrib tables
# so that the author field is updated with the new alias
#
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=Alias)
def update_alias(sender, instance, **kwargs):
    
    Commit.objects.filter(author__slug=instance.slug).update(author=instance.author)
    Contrib.objects.filter(author__slug=instance.slug).update(author=instance.author)
    Author.objects.filter(slug=instance.slug).delete()