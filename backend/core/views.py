from django.shortcuts import render
from django.http import HttpResponse


from django.shortcuts import render 
from rest_framework.views import APIView 
from . models import *
from rest_framework.response import Response 
from rest_framework import generics
from . serializer import ReactSerializer, TestSerializer

from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status


from core.ada import * 

from django_nextjs.render import render_nextjs_page_sync

def index(request):
    return render_nextjs_page_sync(request)
     # return HttpResponse("Hello, world. You're at the polls index.")

# Create your views here.

obj = create_obj()




@api_view(['GET', 'POST'])
def test_list(request):
    if request.method == 'GET':
        data = Test.objects.all()

        serializer = TestSerializer(data, context={'request': request}, many=True)

        return Response(serializer.data)

    elif request.method == 'POST':
        obj.generate() 
        data = obj.df 
        for index, row in data.iterrows():
          test = Test(id=index, title=row['input'], topic = row['topic'], label = row['output'])
          if Test.objects.filter(title=test_list.title).exists(): # does not work with get
               pass
          else: 
               obj.save()


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
