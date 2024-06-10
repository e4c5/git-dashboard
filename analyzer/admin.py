from django.contrib import admin
from .models import Project, Repository, Commit, Author, Alias, Contrib
from django import forms

class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name','lines','contributors','skip')
    list_filter = ('skip',)
    list_editable = ('skip',)

class ProjectListFilter(admin.SimpleListFilter):
    """ Filter repositories by project.
    Project list is sorted by name. """
    title = 'project'
    parameter_name = 'project'

    def lookups(self, request, model_admin):
        return [(p.name, p.name) for p in Project.objects.order_by('name')]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(project__name=self.value())
        else:
            return queryset
        
class RepositoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'last_fetch', 'project','lines','contributors','skip','success')
    list_filter = (ProjectListFilter,'skip','success')
    list_editable = ('skip','success') 


class CommitAdmin(admin.ModelAdmin):
    list_display = ('hash', 'author', 'repository', 'timestamp')
    search_fields = ('author__name', 'repository__name')

class AuthorAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')  
    search_fields = ('name',)


class AliasAdmin(admin.ModelAdmin):
    raw_id_fields = ('author',)
    search_fields = ('author__name',)
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