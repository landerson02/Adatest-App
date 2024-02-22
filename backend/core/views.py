from django.shortcuts import render
from django.http import HttpResponse


from django.shortcuts import render 
from rest_framework.views import APIView 
from . models import *
from rest_framework.response import Response 
from . serializer import *

def index(request): 
     return HttpResponse("Hello, world. You're at the polls index.") 

# Create your views here.



class ReactView(APIView): 
    
    serializer_class = ReactSerializer 
  
    def get(self, request): 
        detail = [ {"name": detail.topic,"detail": detail.topic, "id": detail.id, "topic": detail.topic}  
        for detail in Test.objects.all()] 
        return Response(detail) 
  
    def post(self, request): 
  
        serializer = ReactSerializer(data=request.data) 
        if serializer.is_valid(raise_exception=True): 
            serializer.save() 
            return Response(serializer.data) 
