from django.shortcuts import render
from django.http import HttpResponse


from django.shortcuts import render 
from rest_framework.views import APIView 
from . models import *
from rest_framework.response import Response 
from rest_framework import generics
from . serializer import *

def index(request): 
     return HttpResponse("Hello, world. You're at the polls index.") 

# Create your views here.



class TestView(generics.ListAPIView): 
    queryset = Test.objects.all()
    serializer_class = TestSerializer 

  
   