import uuid

from django.db import models


# Create your models here.

class Test(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    title = models.TextField()
    topic = models.CharField(max_length=50)
    validity = models.CharField(max_length=50, default="Unapproved")
    label = models.CharField(max_length=20, default="Unacceptable")
    ground_truth = models.CharField(max_length=20, default="Unknown")


class Log(models.Model):
    test_ids = models.TextField()
    action = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    id = models.UUIDField(max_length=50, primary_key=True, default=uuid.uuid4, editable=False)
    

class Perturbation(models.Model): 
    test_parent = models.ForeignKey(Test, on_delete=models.CASCADE)

    label = models.CharField(max_length=20, default="Unacceptable")
    id = models.UUIDField(max_length=50, default=uuid.uuid4, editable=False, primary_key=True)
    title = models.TextField()
    type = models.CharField(max_length=20, default="spelling")


