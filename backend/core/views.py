from django.shortcuts import render
from django.http import HttpResponse


from django.shortcuts import render 
from rest_framework.views import APIView 
from . models import *
from rest_framework.response import Response 
from rest_framework import generics
from . serializer import ReactSerializer, TestSerializer

<<<<<<< HEAD

from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status




=======
from django_nextjs.render import render_nextjs_page_sync

def index(request):
    return render_nextjs_page_sync(request)
     # return HttpResponse("Hello, world. You're at the polls index.")
>>>>>>> 6295df63214b028f53972c747dde70db60cdc6ae

# Create your views here.



<<<<<<< HEAD
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
=======
class TestView(generics.ListAPIView):
    queryset = Test.objects.all()
    serializer_class = TestSerializer
>>>>>>> 6295df63214b028f53972c747dde70db60cdc6ae



class ReactView(APIView):

    serializer_class = ReactSerializer

    def get(self, request):
        # detail = [ {"name": detail.topic,"detail": detail.topic, "id": detail.id, "topic": detail.topic}
        # for detail in Test.objects.all()]
        # return Response(detail)
        dummy_data = [
            {"test": "django1", "output": "Acceptable", "concept": "PE", "id": 1, "label": 'labelx'},
            {"test": "django2", "output": "Unacceptable", "concept": "PE", "id": 2, "label": 'labelx'},
            {"test": "django3", "output": "Acceptable", "concept": "PE", "id": 3, "label": 'labelx'},
        ]
        return Response(dummy_data)

    def post(self, request):

        serializer = ReactSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data)
