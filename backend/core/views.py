from django.shortcuts import render
from django.http import HttpResponse


from django.shortcuts import render 
from rest_framework.views import APIView 
from . models import *
from rest_framework.response import Response 
from rest_framework import generics
from . serializer import *


from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status





# Create your views here.



@api_view(['GET', 'POST'])
def test_list(request):
    if request.method == 'GET':
        data = Test.objects.all()

        serializer = TestSerializer(data, context={'request': request}, many=True)

        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = TestSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

  
   