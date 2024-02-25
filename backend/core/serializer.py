from rest_framework import serializers 
from . models import *
  
class TestSerializer(serializers.ModelSerializer): 
    class Meta: 
        model = Test 
        fields = ('id', 'title', 'topic', 'validity', 'label')