# Generated by Django 5.1.4 on 2025-02-27 02:40

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('links', '0004_link_background_color_link_link_type_link_shape_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='link',
            name='background_color',
        ),
        migrations.RemoveField(
            model_name='link',
            name='link_type',
        ),
        migrations.RemoveField(
            model_name='link',
            name='shape',
        ),
        migrations.RemoveField(
            model_name='link',
            name='text_color',
        ),
    ]
