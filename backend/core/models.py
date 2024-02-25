from django.db import models

# Create your models here.

class Test(models.Model):
    id = models.CharField(max_length=50, primary_key= True)
    title = models.TextField()
    topic = models.CharField(max_length=50)
    validity = models.CharField(max_length=50)
    label = models.CharField(max_length = 20, default = "Unacceptable")



     



