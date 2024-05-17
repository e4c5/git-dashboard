from django.contrib import admin
from .models import Project, Repository, Commit, Author, Alias, Contrib

class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name','lines','contributors')

class RepositoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'url', 'project','lines','contributors') 

class CommitAdmin(admin.ModelAdmin):
    list_display = ('hash', 'author', 'repository', 'timestamp')

class AuthorAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')  

class AliasAdmin(admin.ModelAdmin):
    list_display = ('slug', 'author') 

class ContribAdmin(admin.ModelAdmin):
    list_display = ('author', 'count', 'repository') 

# Register your models here.
admin.site.register(Project, ProjectAdmin)
admin.site.register(Repository, RepositoryAdmin)
admin.site.register(Commit, CommitAdmin)
admin.site.register(Author, AuthorAdmin)
admin.site.register(Alias, AliasAdmin)
admin.site.register(Contrib, ContribAdmin)