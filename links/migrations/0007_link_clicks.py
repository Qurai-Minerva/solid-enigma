# Generated by Django 5.1.4 on 2025-02-28 00:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('links', '0006_alter_link_options_link_position'),
    ]

    operations = [
        migrations.AddField(
            model_name='link',
            name='clicks',
            field=models.PositiveIntegerField(default=0),
        ),
    ]
