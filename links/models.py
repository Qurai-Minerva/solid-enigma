from django.db import models
from django.contrib.auth.models import User

class Group(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Link(models.Model):
    title = models.CharField(max_length=100)
    url = models.URLField()
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='links')
    position = models.PositiveIntegerField(default=0)
    clicks = models.PositiveIntegerField(default=0)  # Add this field to track clicks

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['position']