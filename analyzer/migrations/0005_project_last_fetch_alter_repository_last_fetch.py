# Generated by Django 5.0.1 on 2024-05-17 13:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('analyzer', '0004_project_contributors_project_lines_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='last_fetch',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='repository',
            name='last_fetch',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
