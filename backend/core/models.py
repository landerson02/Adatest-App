import uuid

from django.db import models


# Create your models here.

class Test(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    title = models.TextField()
    topic = models.CharField(max_length=50)
    validity = models.CharField(max_length=50, default="Unapproved")
    label = models.CharField(max_length=20, default="Unacceptable")


class Log(models.Model):
    essay = models.CharField(max_length=50)
    action = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    id = models.UUIDField(max_length=50, primary_key=True, default=uuid.uuid4, editable=False)

    def __str__(self):
        return self.action
