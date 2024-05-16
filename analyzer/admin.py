from django.contrib import admin
from .models import Project, Repository, Commit, Author, Alias

class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name',)

class RepositoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'url', 'project') 

class CommitAdmin(admin.ModelAdmin):
    list_display = ('hash', 'author', 'repository', 'timestamp')

class AuthorAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')  

class AliasAdmin(admin.ModelAdmin):
    list_display = ('slug', 'author') 

# Register your models here.
admin.site.register(Project, ProjectAdmin)
admin.site.register(Repository, RepositoryAdmin)
admin.site.register(Commit, CommitAdmin)
admin.site.register(Author, AuthorAdmin)
admin.site.register(Alias, AliasAdmin)