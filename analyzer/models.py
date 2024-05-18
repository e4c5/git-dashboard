from django.db import models
from django.db.models import F
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.text import slugify

# Create your models here.
class Project(models.Model):
    name = models.CharField(max_length=100)
    lines = models.IntegerField(default=0)
    contributors = models.IntegerField(default=0)
    last_fetch = models.DateTimeField(null=True, blank=True)
    skip = models.BooleanField(default=False)

    def __str__(self):
        return self.name
    

class Author(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)

    def __str__(self):
        return self.name
    
    @classmethod
    def get_or_create(cls,name):
        slug = slugify(name.lower().replace('.', ' '))
        try:
            return Alias.objects.get(slug=slug).author
        except Alias.DoesNotExist:
            author, _ = cls.objects.get_or_create(slug=slug, defaults = {'name': name, 'slug': slug})
            return author
    
class Alias(models.Model):
    author = models.ForeignKey('Author', on_delete=models.PROTECT)
    slug = models.SlugField(max_length=100, unique=True)


class Repository(models.Model):
    name = models.CharField(max_length=100, unique=True)
    last_fetch = models.DateTimeField(null=True, blank=True)
    url = models.URLField()
    project = models.ForeignKey(Project, on_delete=models.PROTECT)
    lines = models.IntegerField(default=0)
    contributors = models.IntegerField(default=0)
    skip = models.BooleanField(default=False)
    success = models.BooleanField(default=True)

    def __str__(self):
        return self.project.name + '/' + self.name


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
       

@receiver(post_save, sender=Alias)
def update_alias(sender, instance, **kwargs):
    Contrib.objects.filter(author__slug=instance.slug).delete()
    Commit.objects.filter(author__slug=instance.slug).delete()
    Author.objects.filter(slug=instance.slug).delete()
            
    