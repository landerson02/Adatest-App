from django.db import models

# Create your models here.

class Test(models.Model):
    title = models.TextField()
    topic = models.CharField(max_length=50)
    # id = models.CharField(max_length=50)
    id = models.AutoField(primary_key=True)
    validity = models.CharField(max_length=50)



     



